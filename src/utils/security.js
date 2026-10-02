// Security & Data Hygiene Utilities
// Zero backdoors, PII masking, and anti-collision mutex

export function maskAadhaar(raw) {
  if (!raw) return "XXXX-XXXX-XXXX";
  const clean = String(raw).replace(/\D/g, '');
  if (clean.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

export function maskPhone(phone) {
  if (!phone) return "+91 ******0000";
  const str = String(phone).trim();
  if (str.length < 4) return "+91 ******0000";
  const last4 = str.slice(-4);
  return `+91 ******${last4}`;
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Checks if two date ranges collide (Standard hotel booking interval overlap)
 * Room is considered booked from checkIn at 12:00 PM to checkOut at 12:00 PM
 */
export function hasDateCollision(start1, end1, start2, end2) {
  const dStart1 = new Date(start1).getTime();
  const dEnd1 = new Date(end1).getTime();
  const dStart2 = new Date(start2).getTime();
  const dEnd2 = new Date(end2).getTime();

  return !(dEnd1 <= dStart2 || dStart1 >= dEnd2);
}

export function validateUpi(upi) {
  return /^[\w.-]+@[\w.-]+$/.test(String(upi).trim());
}

export function validatePin(pin) {
  return /^\d{4,6}$/.test(String(pin).trim());
}
