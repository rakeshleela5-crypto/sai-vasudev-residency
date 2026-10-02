const fs = require('fs');

const d1Data = JSON.parse(fs.readFileSync('scripts/d1_dump.json', 'utf8'));
const liveTables = {};
for (const t of d1Data.tables) {
  liveTables[t.name] = t.columns.map(c => c.name);
}

console.log('=== AUDITING HOTEL SAI INTERNATIONAL ONE-DATABASE ARCHITECTURE ===\n');
console.log(`Live Tables in D1: ${Object.keys(liveTables).length}`);

// 1. Check bookings table columns
const expectedBookingsCols = [
  'booking_id', 'room_number', 'guest_name', 'guest_phone', 'guest_email',
  'id_proof_type', 'id_proof_masked', 'state_of_origin', 'is_interstate',
  'check_in_date', 'check_out_date', 'check_in_time', 'nights', 'adults', 'children',
  'tariff_per_night', 'base_total', 'cgst', 'sgst', 'total_amount', 'advance_deposit',
  'balance_due', 'payment_mode', 'payment_status', 'booking_status', 'is_b2b',
  'corporate_id', 'corporate_gstin', 'company_name', 'bill_no', 'billing_address',
  'billing_type', 'meal_plan', 'grc_no', 'pax', 'is_non_gst', 'consent_dpdp',
  'special_requests', 'created_at', 'updated_at'
];
const currentBookingCols = liveTables['bookings'] || [];
const missingBookingCols = expectedBookingsCols.filter(c => !currentBookingCols.includes(c));
console.log('\n[1] Bookings Missing Columns:', missingBookingCols);

// 2. Check cashier_shift_handovers columns
const expectedShiftCols = [
  'handover_id', 'shift_date', 'shift_type', 'outgoing_cashier', 'incoming_cashier',
  'opening_float', 'cash_sales', 'petty_cash_paid', 'cash_collected', 'upi_collected',
  'card_collected', 'corporate_credit', 'total_revenue', 'expected_drawer_cash',
  'actual_drawer_cash', 'closing_cash_expected', 'closing_cash_actual',
  'variance_amount', 'variance', 'discrepancy_reason', 'status', 'verified_by',
  'shift_lead', 'handover_signed', 'signed_at', 'notes', 'created_at'
];
const currentShiftCols = liveTables['cashier_shift_handovers'] || [];
const missingShiftCols = expectedShiftCols.filter(c => !currentShiftCols.includes(c));
console.log('\n[2] Shift Handovers Missing Columns:', missingShiftCols);

// 3. Check corporate_partners columns
const expectedCorpCols = [
  'corporate_id', 'company_name', 'gstin', 'location', 'contact_person',
  'contact_email', 'contact_phone', 'contracted_discount_percent', 'credit_days',
  'credit_limit', 'opening_balance', 'status', 'preferred_tier', 'billing_mode'
];
const currentCorpCols = liveTables['corporate_partners'] || [];
const missingCorpCols = expectedCorpCols.filter(c => !currentCorpCols.includes(c));
console.log('\n[3] Corporate Partners Missing Columns:', missingCorpCols);

// 4. Check folio_transactions columns
const expectedFolioCols = [
  'transaction_id', 'folio_id', 'booking_id', 'room_number', 'transaction_type',
  'outlet', 'item_code', 'description', 'debit_amount', 'credit_amount',
  'taxable_base', 'gst_rate', 'cgst', 'sgst', 'sac_code', 'invoice_id',
  'is_locked', 'payment_mode', 'rule48_copy', 'created_by', 'created_at'
];
const currentFolioCols = liveTables['folio_transactions'] || [];
const missingFolioCols = expectedFolioCols.filter(c => !currentFolioCols.includes(c));
console.log('\n[4] Folio Transactions Missing Columns:', missingFolioCols);

// 5. Check entirely missing tables for features in the app:
const requiredNewTables = [
  // A. TallyPrime Accounting Hub
  'tally_ledgers',
  'tally_vouchers',
  'tally_voucher_lines',

  // B. GST Portal & GSTR-2B ITC Hub
  'gstr1_filings',
  'gstr2b_inward_supplies',
  'gst_fom_records',

  // C. Front Desk Guest Transfers & Cabs
  'guest_transfers',

  // D. POS Table Settlements
  'restaurant_table_settlements',

  // E. Corporate Advance Quotations
  'corporate_quotations',

  // F. Rule 48 Statutory Printing Audit Logs
  'invoice_print_audit_logs',

  // G. Universal Inline Editor Persistent Overrides
  'universal_inline_overrides'
];

const missingTables = requiredNewTables.filter(t => !liveTables[t]);
console.log('\n[5] Entirely Missing Tables for Project Features:');
console.log(missingTables);
