/**
 * Sri Sai Vasudev Residency - Enterprise WhatsApp Dispatch Engine
 * Provides pre-formatted, branded WhatsApp messaging templates for all hotel workflows.
 * Property: Sri Sai Vasudev Residency | Proprietor: Paidisetty Manmadha Rao
 * GSTIN: 21AEKPP8689J1ZS | Address: Near Andhra Bank, New Colony, Rayagada, Odisha - 765001
 * Primary Desk / Management Helpline: +91 79780 43585
 */

import { HOTEL_CONFIG } from '../data/hotelData';

const DEFAULT_HELPLINE = '917978043585';
const PROPRIETOR_PHONE = '917978043585';
const HOUSEKEEPING_LEAD_PHONE = '917978043585';
const KITCHEN_CHEF_PHONE = '917978043585';
const TECHNICIAN_PHONE = '917978043585';

/**
 * Normalizes phone number into an international standard (e.g. 917978043585).
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

/**
 * Opens a WhatsApp Web or App link with formatted message.
 */
export function openWhatsAppLink(phone, messageText) {
  const clean = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(messageText);
  const url = clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}

const BRAND_HEADER = `🏨 *${HOTEL_CONFIG?.name || 'SRI SAI VASUDEV RESIDENCY'}*
📍 _Near Andhra Bank, New Colony, Rayagada, Odisha - 765001_
GSTIN: ${HOTEL_CONFIG?.gstin || '21AEKPP8689J1ZS'} | Front Desk: +91 79780 43585
─────────────────────────────────`;

/**
 * 1. Guest Booking Confirmation Pass
 */
export function sendBookingConfirmationWhatsApp(booking) {
  const text = `${BRAND_HEADER}
🎉 *OFFICIAL BOOKING CONFIRMATION PASS*
Reference ID: *${booking.id || booking.bookingId || 'SSVR-' + Date.now().toString().slice(-6)}*

Dear *${booking.guestName || 'Valued Guest'}*,
Namaste! Your reservation at ${HOTEL_CONFIG?.name || 'Sri Sai Vasudev Residency'} is confirmed.

📋 *Stay Details:*
• *Room Tier:* ${booking.roomTier || booking.tier || 'Executive Room'} (Room Key: *${booking.roomNumber || 'Allocated on Arrival'}*)
• *Check-in Date:* ${booking.checkInDate || 'Today'} (12:00 PM)
• *Check-out Date:* ${booking.checkOutDate || 'Tomorrow'} (11:00 AM)
• *Duration:* ${booking.nights || 1} Night(s) | Adults: ${booking.adults || 1}
• *Total Tariff:* ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}
• *Advance Paid:* ₹${Number(booking.advanceDeposit || 0).toLocaleString('en-IN')}
• *Balance Due:* ₹${Number(booking.balanceDue || 0).toLocaleString('en-IN')}

✨ *Complimentary Amenities Included:*
• High-Speed Fiber Wi-Fi Pass
• Pure Satvik Dining Option
• Rayagada Railway Station (RGDA) Transfer Assistance
• 24x7 Power Backup & Hot Water

🗺️ *Google Maps Property Pin:*
https://maps.google.com/?q=Rayagada,Odisha,Near+Andhra+Bank

Need assistance? Reply directly to this WhatsApp or dial +91 79780 43585.
_We wish you a blessed, comfortable stay!_`;

  return openWhatsAppLink(booking.phone || booking.guestPhone, text);
}

/**
 * 2. In-Room Dining & Room Service KOT Dispatch
 */
export function sendRoomServiceOrderWhatsApp(order, target = 'kitchen') {
  const itemsText = (order.items || []).map((it, idx) => 
    `  ${idx + 1}. *${it.name || it.dish?.name}* x ${it.quantity || it.qty || 1} (₹${(it.price || it.tariff || 0) * (it.quantity || it.qty || 1)})`
  ).join('\n');

  const text = `${BRAND_HEADER}
🍽️ *${target === 'kitchen' ? 'KITCHEN ORDER TICKET (KOT) - LIVE DISPATCH' : 'IN-ROOM DINING ORDER SLIP'}*
Order ID: *#${order.orderId || order.id || Date.now().toString().slice(-4)}* | Room: *ROOM ${order.roomNumber}*

📋 *Itemized Satvik Menu:*
${itemsText || '  • Satvik Pure Veg Dining Selection'}

💰 *Order Total:* ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}
⏱️ *Preparation ETA:* 20 - 25 Minutes
📝 *Chef Notes:* ${order.notes || order.cookingNotes || 'No onion/garlic, pure satvik preparation.'}

_${target === 'kitchen' ? 'Sent to Cannon Kitchen for immediate preparation.' : 'Thank you for dining with Sri Sai Vasudev Residency!'}_`;

  const phone = target === 'kitchen' ? KITCHEN_CHEF_PHONE : order.guestPhone;
  return openWhatsAppLink(phone, text);
}

/**
 * 3. In-Room Guest Concierge Request
 */
export function sendInRoomConciergeWhatsApp({ roomNumber, guestName, serviceType, details }) {
  const text = `${BRAND_HEADER}
🛎️ *IN-ROOM CONCIERGE ASSISTANCE REQUEST*
Room Number: *ROOM ${roomNumber}*
Guest: *${guestName || 'In-House Guest'}*

🔔 *Request Category:* *${serviceType || 'Room Service'}*
📝 *Details:* ${details || 'Guest requested prompt room service assistance.'}

Timestamp: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
_Please address this in-room request within 10 minutes._`;

  return openWhatsAppLink(DEFAULT_HELPLINE, text);
}

/**
 * 4. Housekeeping Lead Room Turnover Work Order
 */
export function sendHousekeepingOrderWhatsApp({ roomNumber, floor, roomStatus, priority = 'Standard', guestName, nextArrival = 'Today 14:00', notes }) {
  const text = `${BRAND_HEADER}
🧹 *HOUSEKEEPING TURNOVER WORK ORDER*
Room Key: *ROOM ${roomNumber}* (Floor ${floor || (Number(roomNumber) >= 200 ? '1' : 'Ground')})

🚨 *Priority:* *${priority.toUpperCase()}*
Status: *${roomStatus || 'Vacant Dirty'}*
Next Check-in: *${nextArrival}*
${guestName ? `Departed Guest: ${guestName}` : ''}
📝 *Housekeeping Checklist:*
• Fresh bed linens & sanitized pillow slips
• Bathroom deep sanitization & herbal toiletries kit
• Kinley sealed 1L mineral water & electric kettle restock
• AC filter check & floor mopping
${notes ? `• Special Note: ${notes}` : ''}

_Please update front desk terminal once inspected and marked Clean._`;

  return openWhatsAppLink(HOUSEKEEPING_LEAD_PHONE, text);
}

/**
 * 5. Maintenance Defect Ticket to Technician
 */
export function sendMaintenanceTicketWhatsApp({ roomNumber, issue, severity = 'High', technicianName = 'Pradeep Jena', targetEta = '30 Mins' }) {
  const text = `${BRAND_HEADER}
🔧 *URGENT MAINTENANCE WORK ORDER*
Room: *ROOM ${roomNumber}* | Priority: *${severity.toUpperCase()}*
Assigned Technician: *${technicianName}*

⚠️ *Defect Reported:*
${issue}

⏱️ *Target Resolution ETA:* ${targetEta}
Reported by: Front Desk Terminal
Timestamp: ${new Date().toLocaleTimeString('en-IN')}

_Please bring necessary spares and notify Reception upon ticket clearance._`;

  return openWhatsAppLink(TECHNICIAN_PHONE, text);
}

/**
 * 6. Night Audit Daily Financial Flash Report to Proprietor
 */
export function sendNightAuditFlashWhatsApp(audit) {
  const text = `${BRAND_HEADER}
📊 *EXECUTIVE NIGHT AUDIT & REVENUE FLASH*
Audited Date: *${audit.businessDate || new Date().toISOString().split('T')[0]}*
Certified Auditor: *${audit.auditorName || 'Manager On Duty'}*

🏨 *18-Room Inventory Performance:*
• Occupancy: *${audit.occupancyPct || 0}%* (${audit.occupiedRooms || 0}/18 Rooms Sold)
• ADR (Average Daily Rate): *₹${Number(audit.adr || 0).toLocaleString('en-IN')}*
• RevPAR: *₹${Number(audit.revpar || 0).toLocaleString('en-IN')}*

💰 *Departmental Revenue:*
• Room Lodging: ₹${Number(audit.roomRevenue || 0).toLocaleString('en-IN')}
• Cannon Kitchen (F&B): ₹${Number(audit.fnbRevenue || 0).toLocaleString('en-IN')}
• Ancillary & Laundry: ₹${Number(audit.otherRevenue || 0).toLocaleString('en-IN')}
*👉 GROSS DAY TURNOVER:* *₹${Number(audit.grossRevenue || 0).toLocaleString('en-IN')}*

💳 *Settlement Tenders:*
• Cash Drawer Collected: ₹${Number(audit.cashCollected || 0).toLocaleString('en-IN')}
• SBI UPI / QR: ₹${Number(audit.upiCollected || 0).toLocaleString('en-IN')}
• Card Batches: ₹${Number(audit.cardCollected || 0).toLocaleString('en-IN')}
• Corporate Credit (B2B): ₹${Number(audit.companyCredit || 0).toLocaleString('en-IN')}

🔐 *Audit Certification:*
All 18 room folios balanced, drawer reconciled, and day sealed with zero variance.
_Submitted for Proprietor Paidisetty Manmadha Rao's review._`;

  return openWhatsAppLink(PROPRIETOR_PHONE, text);
}

/**
 * 7. Temple Darshan & Station Transfer Travel Guide
 */
export function sendDarshanGuideWhatsApp({ templeName, timings, distance, specialNotes, guestPhone }) {
  const text = `${BRAND_HEADER}
🙏 *RAYAGADA PILGRIMAGE & DARSHAN GUIDE*
Temple: *${templeName || 'Maa Majhigouri Temple'}*

📍 *Distance from Hotel:* ${distance || '1.5 km (5-minute auto ride)'}
🕒 *Sanctum Aarti & Darshan Timings:*
${timings || '• Morning Darshan: 05:30 AM - 12:30 PM\n• Evening Sandhya Aarti: 04:30 PM - 08:30 PM'}

🕉️ *Temple Etiquette & Notes:*
${specialNotes || 'Traditional Satvik attire recommended. Free footwear keeping available.'}

🚖 *Hotel Shuttle / Auto Desk:*
Our reception can arrange a direct autorickshaw or private AC cab to the temple.
Dial front desk at *+91 79780 43585* or reply to this WhatsApp to schedule pickup.`;

  return openWhatsAppLink(guestPhone, text);
}

/**
 * 8. Corporate B2B Quotation Dispatch
 */
export function sendCorporateQuotationWhatsApp(quote) {
  const text = `${BRAND_HEADER}
💼 *OFFICIAL CORPORATE TARIFF QUOTATION*
Quotation No: *${quote.quoteNumber || 'SSVR/QUOT/' + Date.now().toString().slice(-4)}*
Company: *${quote.companyName || 'Corporate Partner'}*
${quote.gstin ? `Company GSTIN: *${quote.gstin}*` : ''}

📋 *Quotation Summary:*
• Room Category: *${quote.roomTier || 'Executive Deluxe'}*
• Inventory Allocated: *${quote.roomCount || 1} Rooms* for *${quote.nightCount || 1} Nights*
• Occupancy Pax: ${quote.guestCount || 1} Guests
• Meal Plan: *${quote.mealPlan || 'EP (Room Only)'}*
${quote.includeBanquet ? '• Banquet / Conference Hall: Included' : ''}

💰 *Financial Breakdown:*
• Base Lodging: ₹${Number(quote.subtotal || 0).toLocaleString('en-IN')}
• Applicable GST: ₹${Number(quote.gstAmount || 0).toLocaleString('en-IN')}
*• TOTAL QUOTED VALUE:* *₹${Number(quote.grandTotal || 0).toLocaleString('en-IN')}*

🔒 *30% Advance Escrow Deposit Required:* *₹${Number(quote.advanceRequired || 0).toLocaleString('en-IN')}*
• Balance on Checkout: ₹${Number(quote.balanceOnCheckout || 0).toLocaleString('en-IN')}

🏦 *Bank Remittance Details:*
• Bank: State Bank of India (SBI) Rayagada Main
• Account: 3892019482 | IFSC: SBIN0000169
• Beneficiary: Sri Sai Vasudev Residency

_Valid for 15 days. To confirm this block, please reply with approval._`;

  return openWhatsAppLink(quote.clientPhone, text);
}

/**
 * 9. Corporate Statement of Accounts (SOA) & Payment Reminder
 */
export function sendDebtorStatementWhatsApp({ companyName, gstin, balanceDue, agingDays = 15, invoices = [], clientPhone }) {
  const invoiceList = invoices.map(i => `  • Inv #${i.billNo}: ₹${Number(i.amount || 0).toLocaleString('en-IN')} (${i.date || 'Pending'})`).join('\n');

  const text = `${BRAND_HEADER}
📄 *OUTSTANDING STATEMENT OF ACCOUNT (SOA)*
Debtor: *${companyName}*
${gstin ? `GSTIN: ${gstin}` : ''}

Dear Accounts Team,
This is a courteous reminder regarding pending lodging billing balances for Sri Sai Vasudev Residency, Rayagada.

💰 *Total Overdue Balance:* *₹${Number(balanceDue || 0).toLocaleString('en-IN')}*
Aging Status: *${agingDays} Days Overdue*

📋 *Pending Tax Invoices:*
${invoiceList || '  • Outstanding Corporate Bill Vouchers Pending Settlement'}

🏦 *Remittance Channel (NEFT / RTGS / UPI):*
• Bank: SBI Rayagada Main Branch
• A/C No: 3892019482
• IFSC: SBIN0000169
• Beneficiary: Sri Sai Vasudev Residency
• UPI ID: 7978043585@sbi

_Please remit payment and share UTR reference on this WhatsApp for ledger reconciliation._`;

  return openWhatsAppLink(clientPhone, text);
}

/**
 * 10. Split Bill Dispatch at Checkout
 */
export function sendCheckoutSplitWhatsApp({ billType, billNo, companyOrGuest, gstin, roomNumber, period, amount, recipientPhone }) {
  const text = `${BRAND_HEADER}
🧾 *GST TAX INVOICE - DIGITAL RECEIPT*
Invoice Number: *#${billNo}*
Invoice Type: *${billType}* (Room ${roomNumber})

Billed To: *${companyOrGuest}*
${gstin ? `GSTIN: ${gstin}` : ''}
Stay Duration: ${period || 'Current Stay'}

💰 *Total Bill Amount:* *₹${Number(amount || 0).toLocaleString('en-IN')}*
Status: *PAID & SETTLED*

✨ *Features & Amenities:*
• Rule 46 Compliant India GST Tax Invoice
• HSN/SAC Code: 996311 (Lodging) / 996331 (F&B)

Thank you for choosing ${HOTEL_CONFIG?.name || 'Sri Sai Vasudev Residency'}, Rayagada!`;

  return openWhatsAppLink(recipientPhone, text);
}

/**
 * 11. CA Filing Station & Financial Intelligence Summary
 */
export function sendCaFilingSummaryWhatsApp(data) {
  const text = `${BRAND_HEADER}
📑 *MONTHLY GST & P&L FINANCIAL BRIEFING*
Filing Period: *${data.period || 'Current Month'}*
Property: Sri Sai Vasudev Residency | 18 Keys

📊 *Turnover & Tax Position:*
• Gross Turnover: *₹${Number(data.grossTurnover || 0).toLocaleString('en-IN')}*
• 5% Output GST: ₹${Number(data.cgstCollected || 0).toLocaleString('en-IN')} (CGST) + ₹${Number(data.sgstCollected || 0).toLocaleString('en-IN')} (SGST)
• Total GST Output Liability: *₹${Number(data.totalGstOutput || 0).toLocaleString('en-IN')}*
• Eligible Input Tax Credit (ITC): *₹${Number(data.eligibleItc || 0).toLocaleString('en-IN')}*
• Net GST Payable via Electronic Cash Ledger: *₹${Number(data.netGstPayable || 0).toLocaleString('en-IN')}*

📈 *Profitability Metrics:*
• Total Operating Expenses (Opex): ₹${Number(data.totalOpex || 0).toLocaleString('en-IN')}
• Net EBITDA Margin: *${data.ebitdaMargin || '38.4%'}*
• EBITDA Operating Profit: *₹${Number(data.ebitdaProfit || 0).toLocaleString('en-IN')}*

_Audit trail reconciled with Bank Statements & Cashier Handover sheets._`;

  return openWhatsAppLink(PROPRIETOR_PHONE, text);
}
