// Cloudflare Pages Function: POST /api/payments/create-order
// Securely creates a Razorpay order on the backend.
// The Razorpay SECRET KEY never reaches the frontend browser.

const ALLOWED_ORIGINS = [
  "https://sai-vasudev-residency.pages.dev",
  "https://hotel-sai-international.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function getHeaders(origin) {
  const allowed = origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".sai-vasudev-residency.pages.dev") || origin.endsWith(".hotel-sai-international.pages.dev"));
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowed ? origin : "https://sai-vasudev-residency.pages.dev",
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

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");

  // Guard: Razorpay keys must be set as Wrangler secrets
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return jsonRes({
      success: false,
      error: "Payment gateway not configured. Please contact hotel admin."
    }, 503, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ success: false, error: "Invalid JSON payload." }, 400, origin);
  }

  const { amount, currency = "INR", receipt, notes } = body;

  // Validate amount
  if (!amount || typeof amount !== "number" || amount <= 0 || amount > 500000) {
    return jsonRes({
      success: false,
      error: "Valid amount (in INR Rupees, max ₹5,00,000) is required."
    }, 400, origin);
  }

  const amountPaise = Math.round(amount * 100); // Convert ₹ to paise

  try {
    // Razorpay REST API — direct fetch (no heavy SDK needed in edge workers)
    const authHeader = "Basic " + btoa(`${keyId}:${keySecret}`);

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {
          hotel: "Sri Sai Vasudev Residency",
          location: "Near Andhra Bank, New Colony, Rayagada, Odisha 765001"
        }
      })
    });

    const orderData = await razorpayRes.json();

    if (!razorpayRes.ok) {
      console.error("[RAZORPAY CREATE-ORDER ERROR]", JSON.stringify(orderData));
      return jsonRes({
        success: false,
        error: orderData?.error?.description || "Failed to create payment order. Please try again."
      }, 400, origin);
    }

    // Log to D1 for audit trail
    try {
      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO payment_orders (order_id, amount_paise, currency, receipt, status, created_at)
          VALUES (?, ?, ?, ?, 'created', ?)
        `).bind(
          orderData.id,
          amountPaise,
          currency,
          orderData.receipt,
          new Date().toISOString()
        ).run();
      }
    } catch (dbErr) {
      console.error("[PAYMENT ORDER DB ERROR]", dbErr?.message);
    }

    return jsonRes({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: keyId          // Public Razorpay key — safe to send to frontend checkout modal
    }, 200, origin);

  } catch (err) {
    console.error("[CREATE-ORDER FETCH ERROR]", err?.message);
    return jsonRes({
      success: false,
      error: "Network error reaching payment gateway. Please try again."
    }, 502, origin);
  }
}
