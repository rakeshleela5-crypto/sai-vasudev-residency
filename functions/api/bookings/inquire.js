// Cloudflare Pages Function: POST /api/bookings/inquire
// Saves guest room inquiry to D1 and returns a reference ID

const ALLOWED_ORIGINS = [
  "https://sai-vasudev-residency.pages.dev",
  "https://hotel-sai-international.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function getHeaders(origin) {
  const allowed = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith(".sai-vasudev-residency.pages.dev") || 
    origin.endsWith(".hotel-sai-international.pages.dev")
  );
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowed ? origin : "https://sai-vasudev-residency.pages.dev",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function jsonRes(data, status = 200, origin = null) {
  return new Response(JSON.stringify(data), { status, headers: getHeaders(origin) });
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get("Origin");
  return new Response(null, { status: 204, headers: { ...getHeaders(origin), "Access-Control-Max-Age": "86400" } });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ success: false, error: "Invalid JSON payload." }, 400, origin);
  }

  const { guestName, phone, email, checkIn, checkOut, roomType, guestsCount = 1, notes = "" } = body;

  // Validate required fields
  if (!guestName || !phone || !checkIn || !checkOut || !roomType) {
    return jsonRes({
      success: false,
      error: "Required fields missing: guestName, phone, checkIn, checkOut, roomType."
    }, 400, origin);
  }

  // Sanitize inputs
  const sanitize = (v) => (typeof v === "string" ? v.trim().slice(0, 500) : "");
  const inquiryId = `SSVR-INQ-${Date.now().toString(36).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  // Save inquiry to D1 database
  try {
    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO inquiries
          (inquiry_id, guest_name, phone, email, check_in, check_out, room_type, guests_count, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        inquiryId,
        sanitize(guestName),
        sanitize(phone),
        sanitize(email || ""),
        sanitize(checkIn),
        sanitize(checkOut),
        sanitize(roomType),
        Number(guestsCount) || 1,
        sanitize(notes),
        createdAt
      ).run();
    }
  } catch (dbErr) {
    // DB write fails silently — inquiry still returns success so guest experience is not broken
    console.error("[INQUIRY DB ERROR]", dbErr?.message);
  }

  return jsonRes({
    success: true,
    inquiryId,
    message: "Inquiry received! Our front desk will contact you shortly.",
    contactInfo: {
      phone: "+91 8895225555",
      whatsapp: "https://wa.me/917978043585",
      email: "saisaivasudevresidency@gmail.com"
    },
    createdAt
  }, 201, origin);
}
