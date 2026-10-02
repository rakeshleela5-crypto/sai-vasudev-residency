// Cloudflare Pages Function: POST /api/payments/verify
// Verifies Razorpay payment using HMAC-SHA256 signature.
// This is the critical security gate — payment is only confirmed if signature matches.

const ALLOWED_ORIGINS = [
  "https://hotel-sai-international.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function getHeaders(origin) {
  const allowed = origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".hotel-sai-international.pages.dev"));
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowed ? origin : "https://hotel-sai-international.pages.dev",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
}

function jsonRes(data, status = 200, origin = null) {
  return new Response(JSON.stringify(data), { status, headers: getHeaders(origin) });
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get("Origin");
  return new Response(null, {
    status: 204,
    headers: { ...getHeaders(origin), "Access-Control-Max-Age": "86400" }
  });
}

/**
 * HMAC-SHA256 signature verification using Web Crypto API
 * (native to Cloudflare Workers — no Node.js crypto module needed)
 */
async function verifyRazorpaySignature(orderId, paymentId, receivedSignature, keySecret) {
  const message = `${orderId}|${paymentId}`;

  // Import the secret key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Generate HMAC-SHA256 of "orderId|paymentId"
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message)
  );

  // Convert ArrayBuffer to hex string
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return generatedSignature === receivedSignature;
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");

  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return jsonRes({
      success: false,
      error: "Payment gateway not configured on server."
    }, 503, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ success: false, error: "Invalid JSON payload." }, 400, origin);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return jsonRes({
      success: false,
      error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature."
    }, 400, origin);
  }

  let isAuthentic = false;
  try {
    isAuthentic = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );
  } catch (cryptoErr) {
    console.error("[CRYPTO ERROR]", cryptoErr?.message);
    return jsonRes({ success: false, error: "Signature verification failed internally." }, 500, origin);
  }

  if (!isAuthentic) {
    // Log tamper attempt for security audit
    console.warn(`[PAYMENT TAMPER DETECTED] Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);

    // Update D1 audit log with tamper flag
    try {
      if (env.DB) {
        await env.DB.prepare(`
          UPDATE payment_orders SET status = 'tampered', updated_at = ? WHERE order_id = ?
        `).bind(new Date().toISOString(), razorpay_order_id).run();
      }
    } catch (_) {}

    return jsonRes({
      success: false,
      error: "Payment signature verification failed. This transaction cannot be confirmed."
    }, 400, origin);
  }

  // ✅ Payment verified — generate booking reference and update D1
  const bookingRef = `HSI-RES-${Date.now().toString(36).toUpperCase()}`;
  const confirmedAt = new Date().toISOString();

  try {
    if (env.DB) {
      await env.DB.prepare(`
        UPDATE payment_orders
        SET status = 'paid', payment_id = ?, booking_ref = ?, updated_at = ?
        WHERE order_id = ?
      `).bind(razorpay_payment_id, bookingRef, confirmedAt, razorpay_order_id).run();
    }
  } catch (dbErr) {
    console.error("[VERIFY DB ERROR]", dbErr?.message);
  }

  console.log(`[PAYMENT CONFIRMED] Ref: ${bookingRef}, Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);

  return jsonRes({
    success: true,
    status: "confirmed",
    bookingRef,
    message: "Payment verified. Your room reservation is confirmed!",
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    confirmedAt
  }, 200, origin);
}
