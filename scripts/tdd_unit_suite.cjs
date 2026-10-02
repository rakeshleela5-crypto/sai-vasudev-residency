/**
 * STRICT TDD UNIT TEST SUITE (#20)
 * Hotel Sai International - Rayagada, Odisha
 * Tests tax calculations, PII masking, security validators, collision algorithms & folio math
 */

const assert = require('assert');

// 1. In-line reference or imported functions matching src/utils
function maskAadhaar(raw) {
  if (!raw) return "XXXX-XXXX-XXXX";
  const clean = String(raw).replace(/\D/g, '');
  if (clean.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

function maskPhone(phone) {
  if (!phone) return "+91 ******0000";
  const str = String(phone).trim();
  if (str.length < 4) return "+91 ******0000";
  const last4 = str.slice(-4);
  return `+91 ******${last4}`;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function hasDateCollision(start1, end1, start2, end2) {
  const dStart1 = new Date(start1).getTime();
  const dEnd1 = new Date(end1).getTime();
  const dStart2 = new Date(start2).getTime();
  const dEnd2 = new Date(end2).getTime();
  return !(dEnd1 <= dStart2 || dStart1 >= dEnd2);
}

function validateUpi(upi) {
  return /^[\w.-]+@[\w.-]+$/.test(String(upi).trim());
}

function validatePin(pin) {
  return /^\d{4,6}$/.test(String(pin).trim());
}

const CGST_RATE = 2.5;
const SGST_RATE = 2.5;
function calculateRoomTax(baseAmount) {
  const taxable = Number(baseAmount) || 0;
  const cgst = Math.round((taxable * (CGST_RATE / 100)) * 100) / 100;
  const sgst = Math.round((taxable * (SGST_RATE / 100)) * 100) / 100;
  const total = Math.round((taxable + cgst + sgst) * 100) / 100;
  return {
    taxable,
    cgst,
    sgst,
    totalTax: Math.round((cgst + sgst) * 100) / 100,
    total
  };
}

function reconcileFolioSplits(totalBill, splitPayments = []) {
  const totalPaid = splitPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const roundedPaid = Math.round(totalPaid * 100) / 100;
  const roundedBill = Math.round(Number(totalBill) * 100) / 100;
  const balanceDue = Math.round((roundedBill - roundedPaid) * 100) / 100;
  return {
    totalBill: roundedBill,
    totalPaid: roundedPaid,
    balanceDue: Math.max(0, balanceDue),
    isSettled: roundedPaid >= roundedBill,
    variance: Math.round((roundedPaid - roundedBill) * 100) / 100
  };
}

const VALID_ROOM_TRANSITIONS = {
  'Available': ['Occupied', 'Cleaning', 'Maintenance', 'Blocked'],
  'Occupied': ['Cleaning', 'Available'], // Upon checkout -> cleaning
  'Cleaning': ['Available', 'Maintenance'],
  'Maintenance': ['Cleaning', 'Available'],
  'Blocked': ['Available']
};

function canTransitionRoomStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_ROOM_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

// ----------------------------------------------------
// TEST RUNNER HARNESS
// ----------------------------------------------------
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

console.log('\n================================================================');
console.log('  🧪 SUITE #20: STRICT TEST-DRIVEN DEVELOPMENT (TDD) UNIT SUITE');
console.log('================================================================\n');

// 1. Aadhaar Masking Tests (DPDP Act 2023)
console.log('▶ [TDD] DPDP Act 2023: Aadhaar Masking Algorithm');
test('masks standard 12-digit numeric Aadhaar', () => {
  assert.strictEqual(maskAadhaar('123456789012'), 'XXXX-XXXX-9012');
});
test('masks Aadhaar containing spaces or hyphens', () => {
  assert.strictEqual(maskAadhaar('1234 5678 9012'), 'XXXX-XXXX-9012');
  assert.strictEqual(maskAadhaar('1234-5678-9012'), 'XXXX-XXXX-9012');
});
test('handles short or invalid input gracefully', () => {
  assert.strictEqual(maskAadhaar('12'), 'XXXX-XXXX-XXXX');
  assert.strictEqual(maskAadhaar(null), 'XXXX-XXXX-XXXX');
  assert.strictEqual(maskAadhaar(''), 'XXXX-XXXX-XXXX');
});

// 2. Phone Masking Tests
console.log('\n▶ [TDD] Privacy: Guest Phone Masking');
test('masks 10-digit Indian mobile number', () => {
  assert.strictEqual(maskPhone('9437022555'), '+91 ******2555');
  assert.strictEqual(maskPhone('+91 94370 22555'), '+91 ******2555');
});
test('handles invalid or empty phone numbers', () => {
  assert.strictEqual(maskPhone(null), '+91 ******0000');
  assert.strictEqual(maskPhone('99'), '+91 ******0000');
});

// 3. Security XSS Sanitization Tests
console.log('\n▶ [TDD] Security: HTML Entity Encoding & Anti-XSS');
test('escapes malicious script tags and HTML injection', () => {
  const attack = '<script>alert("XSS")</script>';
  assert.strictEqual(escapeHtml(attack), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
});
test('escapes quotes and ampersands in corporate names', () => {
  const company = "Linde & Larsen 'India' \"Ltd\"";
  assert.strictEqual(escapeHtml(company), 'Linde &amp; Larsen &#039;India&#039; &quot;Ltd&quot;');
});

// 4. Date Interval Collision Detection Tests
console.log('\n▶ [TDD] PMS Engine: Hotel Booking Date Collision Algorithm');
test('detects overlapping dates for same room', () => {
  // Stay 1: Sep 20 to Sep 25. Stay 2: Sep 22 to Sep 27 -> COLLISION
  assert.strictEqual(hasDateCollision('2026-09-20', '2026-09-25', '2026-09-22', '2026-09-27'), true);
});
test('allows seamless back-to-back bookings (checkout = checkin)', () => {
  // Stay 1: Sep 20 to Sep 22. Stay 2: Sep 22 to Sep 25 -> NO COLLISION (12:00 PM turnover)
  assert.strictEqual(hasDateCollision('2026-09-20', '2026-09-22', '2026-09-22', '2026-09-25'), false);
});
test('detects fully enclosed booking intervals', () => {
  // Stay 1: Sep 20 to Sep 30. Stay 2: Sep 22 to Sep 24 -> COLLISION
  assert.strictEqual(hasDateCollision('2026-09-20', '2026-09-30', '2026-09-22', '2026-09-24'), true);
});

// 5. UPI & PIN Validators
console.log('\n▶ [TDD] Financial & Access: VPA and PIN Validation');
test('validates correct UPI VPAs', () => {
  assert.strictEqual(validateUpi('hotelsai@ybl'), true);
  assert.strictEqual(validateUpi('manager.sai@okicici'), true);
  assert.strictEqual(validateUpi('9437022555@paytm'), true);
});
test('rejects malformed UPI VPAs', () => {
  assert.strictEqual(validateUpi('hotelsai'), false);
  assert.strictEqual(validateUpi('hotel sai@ybl'), false);
  assert.strictEqual(validateUpi(''), false);
});
test('validates 4-6 digit numeric security PINs', () => {
  assert.strictEqual(validatePin('7650'), true);
  assert.strictEqual(validatePin('123456'), true);
  assert.strictEqual(validatePin('123'), false); // Too short
  assert.strictEqual(validatePin('7650a'), false); // Alphanumeric
});

// 6. Statutory Rule 46 GST Calculations
console.log('\n▶ [TDD] Statutory GST: Rule 46 Room Tax Calculations');
test('calculates exact 5% GST (2.5% CGST + 2.5% SGST) on ₹2,199 Executive AC tariff', () => {
  const result = calculateRoomTax(2199);
  assert.strictEqual(result.taxable, 2199);
  assert.strictEqual(result.cgst, 54.98); // 2199 * 0.025 = 54.975 -> 54.98
  assert.strictEqual(result.sgst, 54.98);
  assert.strictEqual(result.totalTax, 109.96);
  assert.strictEqual(result.total, 2308.96);
});
test('handles zero and null base amounts safely', () => {
  const result = calculateRoomTax(0);
  assert.strictEqual(result.taxable, 0);
  assert.strictEqual(result.cgst, 0);
  assert.strictEqual(result.sgst, 0);
  assert.strictEqual(result.total, 0);
});

// 7. Folio Split Payment Balancing
console.log('\n▶ [TDD] Financial Auditing: Split Payment Balancing & Variance');
test('balances exact split payments across Cash, UPI, and Card', () => {
  const splits = [
    { mode: 'Cash', amount: 1000 },
    { mode: 'UPI', amount: 1000 },
    { mode: 'Card', amount: 308.96 }
  ];
  const rec = reconcileFolioSplits(2308.96, splits);
  assert.strictEqual(rec.isSettled, true);
  assert.strictEqual(rec.balanceDue, 0);
  assert.strictEqual(rec.totalPaid, 2308.96);
  assert.strictEqual(rec.variance, 0);
});
test('detects partial payment and calculates remaining balance', () => {
  const splits = [{ mode: 'UPI', amount: 1500 }];
  const rec = reconcileFolioSplits(2999, splits);
  assert.strictEqual(rec.isSettled, false);
  assert.strictEqual(rec.balanceDue, 1499);
  assert.strictEqual(rec.totalPaid, 1500);
});

// 8. Room State Machine Transitions
console.log('\n▶ [TDD] Operations: Room Status State Machine Constraints');
test('allows legal state transition from Available to Occupied upon check-in', () => {
  assert.strictEqual(canTransitionRoomStatus('Available', 'Occupied'), true);
});
test('allows legal transition from Occupied to Cleaning upon check-out', () => {
  assert.strictEqual(canTransitionRoomStatus('Occupied', 'Cleaning'), true);
});
test('blocks illegal state transition from Maintenance directly to Occupied', () => {
  assert.strictEqual(canTransitionRoomStatus('Maintenance', 'Occupied'), false);
});

// Summary
console.log('\n----------------------------------------------------------------');
console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('----------------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
}
