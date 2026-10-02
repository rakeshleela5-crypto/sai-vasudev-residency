-- ============================================================================
-- HOTEL SAI INTERNATIONAL - CLOUDFLARE D1 ONE DATABASE COMPLETE ARCHITECTURE
-- MIGRATION 0007: UNIFIED DATABASE COMPLETE COVERAGE
-- Adds missing tables and columns for TallyPrime ERP, GST Portal (v1.7), GSTR-2B ITC,
-- Guest Station/Plant Transfers, POS Table Settlements, Corporate Quotations,
-- Rule 48 Statutory Print Logs, and Universal Inline Cell Overrides.
-- ============================================================================
-- 0. SCHEMA EXTENSIONS: COLUMN ADDITIONS FOR EXISTING PRODUCTION TABLES
-- ============================================================================
ALTER TABLE bookings ADD COLUMN check_in_time TEXT DEFAULT '12:00 PM';
ALTER TABLE bookings ADD COLUMN billing_address TEXT;
ALTER TABLE bookings ADD COLUMN billing_type TEXT DEFAULT 'Direct';
ALTER TABLE bookings ADD COLUMN meal_plan TEXT DEFAULT 'EP';
ALTER TABLE bookings ADD COLUMN grc_no TEXT;
ALTER TABLE bookings ADD COLUMN pax INTEGER DEFAULT 1;
ALTER TABLE bookings ADD COLUMN is_non_gst INTEGER DEFAULT 0;

ALTER TABLE cashier_shift_handovers ADD COLUMN cash_collected REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN upi_collected REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN card_collected REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN corporate_credit REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN total_revenue REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN expected_drawer_cash REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN actual_drawer_cash REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN variance_amount REAL DEFAULT 0;
ALTER TABLE cashier_shift_handovers ADD COLUMN discrepancy_reason TEXT;
ALTER TABLE cashier_shift_handovers ADD COLUMN verified_by TEXT DEFAULT 'Duty Manager';
ALTER TABLE cashier_shift_handovers ADD COLUMN shift_lead TEXT DEFAULT 'Sudhakar Reddy';
ALTER TABLE cashier_shift_handovers ADD COLUMN handover_signed INTEGER DEFAULT 1;
ALTER TABLE cashier_shift_handovers ADD COLUMN signed_at TEXT;

ALTER TABLE corporate_partners ADD COLUMN billing_mode TEXT DEFAULT 'Room Only';

ALTER TABLE folio_transactions ADD COLUMN payment_mode TEXT DEFAULT 'Cash';
ALTER TABLE folio_transactions ADD COLUMN rule48_copy TEXT DEFAULT 'ORIGINAL FOR RECIPIENT';

-- 1. TALLY PRIME MASTER LEDGERS (CHART OF ACCOUNTS)
CREATE TABLE IF NOT EXISTS tally_ledgers (
  ledger_id TEXT PRIMARY KEY,
  ledger_name TEXT NOT NULL UNIQUE,
  group_name TEXT NOT NULL,
  opening_balance REAL NOT NULL DEFAULT 0,
  current_balance REAL NOT NULL DEFAULT 0,
  balance_type TEXT NOT NULL DEFAULT 'Dr' CHECK (balance_type IN ('Dr', 'Cr')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. TALLY PRIME DOUBLE-ENTRY BALANCED VOUCHERS
CREATE TABLE IF NOT EXISTS tally_vouchers (
  voucher_no TEXT PRIMARY KEY,
  voucher_type TEXT NOT NULL,
  type_code TEXT NOT NULL,
  voucher_date TEXT NOT NULL,
  ref_no TEXT,
  narration TEXT NOT NULL,
  total_debit REAL NOT NULL,
  total_credit REAL NOT NULL,
  is_balanced INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL DEFAULT 'Accountant',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. TALLY PRIME VOUCHER LINE ITEMS
CREATE TABLE IF NOT EXISTS tally_voucher_lines (
  line_id TEXT PRIMARY KEY,
  voucher_no TEXT NOT NULL,
  dr_cr TEXT NOT NULL CHECK (dr_cr IN ('Dr', 'Cr')),
  ledger_id TEXT NOT NULL,
  ledger_name TEXT NOT NULL,
  amount REAL NOT NULL,
  line_order INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (voucher_no) REFERENCES tally_vouchers(voucher_no) ON DELETE CASCADE
);

-- 4. OFFICIAL GST PORTAL GSTR-1 RETURNS (GSTN SCHEMA v1.7)
CREATE TABLE IF NOT EXISTS gstr1_filings (
  filing_id TEXT PRIMARY KEY,
  return_period TEXT NOT NULL,
  gstin TEXT NOT NULL DEFAULT '21AAACH2877E1Z0',
  financial_year TEXT NOT NULL DEFAULT '2026-2027',
  gross_turnover REAL NOT NULL DEFAULT 0,
  b2b_invoices_count INTEGER NOT NULL DEFAULT 0,
  b2b_taxable_value REAL NOT NULL DEFAULT 0,
  b2b_total_tax REAL NOT NULL DEFAULT 0,
  b2cs_taxable_value REAL NOT NULL DEFAULT 0,
  b2cs_total_tax REAL NOT NULL DEFAULT 0,
  hsn_items_count INTEGER NOT NULL DEFAULT 0,
  docs_issued_count INTEGER NOT NULL DEFAULT 0,
  json_payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Generated',
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. GSTR-2B INPUT TAX CREDIT (ITC) INWARD SUPPLIES & RECONCILIATION
CREATE TABLE IF NOT EXISTS gstr2b_inward_supplies (
  record_id TEXT PRIMARY KEY,
  return_period TEXT NOT NULL,
  supplier_gstin TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date TEXT NOT NULL,
  invoice_value REAL NOT NULL,
  taxable_value REAL NOT NULL,
  cgst REAL NOT NULL DEFAULT 0,
  sgst REAL NOT NULL DEFAULT 0,
  igst REAL NOT NULL DEFAULT 0,
  itc_eligibility TEXT NOT NULL DEFAULT 'Y',
  reconciliation_status TEXT NOT NULL DEFAULT 'UNPROCESSED',
  books_purchase_id TEXT,
  difference_amount REAL NOT NULL DEFAULT 0,
  remarks TEXT,
  imported_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. GST FRONT OFFICE MODULE (FOM) INVOICE REGISTER & AMENDMENTS
CREATE TABLE IF NOT EXISTS gst_fom_records (
  record_id TEXT PRIMARY KEY,
  bill_no TEXT NOT NULL UNIQUE,
  bill_date TEXT NOT NULL,
  ref_no TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  company_name TEXT,
  gstin TEXT,
  billing_address TEXT,
  state_code TEXT NOT NULL DEFAULT '21 (Odisha)',
  taxable_0 REAL NOT NULL DEFAULT 0,
  taxable_5 REAL NOT NULL DEFAULT 0,
  cgst REAL NOT NULL DEFAULT 0,
  sgst REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL,
  amendment_reason TEXT,
  amended_by TEXT DEFAULT 'Front Desk Cashier',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. GUEST STATION / PLANT TRANSFERS & CAB DISPATCH LOG
CREATE TABLE IF NOT EXISTS guest_transfers (
  transfer_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  transfer_type TEXT NOT NULL,
  train_number TEXT,
  scheduled_time TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  assigned_vehicle TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  fare REAL NOT NULL DEFAULT 0,
  is_corporate_courtesy INTEGER NOT NULL DEFAULT 0,
  billing_status TEXT NOT NULL DEFAULT 'Pending Settlement',
  dispatch_status TEXT NOT NULL DEFAULT 'Scheduled',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. RESTAURANT TABLE BILL SETTLEMENTS & CASHIER PAYMENTS
CREATE TABLE IF NOT EXISTS restaurant_table_settlements (
  settlement_id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  kot_id TEXT,
  guest_name TEXT NOT NULL DEFAULT 'Walk-in Diner',
  subtotal REAL NOT NULL DEFAULT 0,
  cgst REAL NOT NULL DEFAULT 0,
  sgst REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL,
  payment_mode TEXT NOT NULL,
  room_number TEXT,
  captain_name TEXT,
  settled_by TEXT NOT NULL DEFAULT 'Restaurant Cashier',
  settled_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. CORPORATE ADVANCE TARIFF QUOTATIONS & PROFORMA PROPOSALS
CREATE TABLE IF NOT EXISTS corporate_quotations (
  quotation_id TEXT PRIMARY KEY,
  corporate_id TEXT,
  company_name TEXT NOT NULL,
  gstin TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  room_tier TEXT NOT NULL DEFAULT 'Executive Room',
  rooms_count INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL DEFAULT 1,
  quoted_rate REAL NOT NULL,
  estimated_total REAL NOT NULL,
  tds_applicable TEXT NOT NULL DEFAULT '194C (2%)',
  valid_until TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. RULE 48 STATUTORY MULTI-COPY INVOICE PRINT AUDIT LOG
CREATE TABLE IF NOT EXISTS invoice_print_audit_logs (
  log_id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  booking_id TEXT,
  room_number TEXT,
  guest_or_company TEXT NOT NULL,
  rule48_copy TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'Tax Invoice (SAC 996311)',
  printed_by TEXT NOT NULL DEFAULT 'Front Desk Cashier',
  printer_identifier TEXT,
  reprint_reason TEXT,
  printed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 11. UNIVERSAL INLINE CELL EDIT PERSISTENT OVERRIDES
CREATE TABLE IF NOT EXISTS universal_inline_overrides (
  override_id TEXT PRIMARY KEY,
  storage_prefix TEXT NOT NULL DEFAULT 'hsi_accounts',
  table_name TEXT NOT NULL,
  row_key TEXT NOT NULL,
  column_key TEXT NOT NULL,
  original_value TEXT,
  overridden_value TEXT NOT NULL,
  edited_by TEXT NOT NULL DEFAULT 'Accountant',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 12. SEED DEFAULT CHART OF ACCOUNTS INTO TALLY_LEDGERS
INSERT OR IGNORE INTO tally_ledgers (ledger_id, ledger_name, group_name, opening_balance, current_balance, balance_type) VALUES
('LED-001', 'Front Desk Cash Drawer', 'Cash-in-hand', 24500.00, 24500.00, 'Dr'),
('LED-002', 'Hotel Petty Cash Safe', 'Cash-in-hand', 5000.00, 5000.00, 'Dr'),
('LED-003', 'SBI Current A/c 49281', 'Bank Accounts', 485200.00, 485200.00, 'Dr'),
('LED-004', 'HDFC Merchant POS Settlement', 'Bank Accounts', 134100.00, 134100.00, 'Dr'),
('LED-005', 'PhonePe Merchant UPI QR', 'Bank Accounts', 92450.00, 92450.00, 'Dr'),
('LED-010', 'Ashok Leyland Limited', 'Sundry Debtors', 214500.00, 214500.00, 'Dr'),
('LED-011', 'JK Paper Mills Ltd', 'Sundry Debtors', 142000.00, 142000.00, 'Dr'),
('LED-012', 'GAIL (India) Limited', 'Sundry Debtors', 88500.00, 88500.00, 'Dr'),
('LED-013', 'IMFA Therubali Division', 'Sundry Debtors', 65000.00, 65000.00, 'Dr'),
('LED-014', 'Guest Room Folio Ledger (In-House)', 'Sundry Debtors', 34875.00, 34875.00, 'Dr'),
('LED-020', 'Rayagada Mandi Fresh Vegetables', 'Sundry Creditors', 18400.00, 18400.00, 'Cr'),
('LED-021', 'Sahu Dairy Milk & Paneer Depot', 'Sundry Creditors', 12250.00, 12250.00, 'Cr'),
('LED-022', 'ECoR Steam Laundry Contractors', 'Sundry Creditors', 15600.00, 15600.00, 'Cr'),
('LED-023', 'HPCL Commercial Gas Agency', 'Sundry Creditors', 8900.00, 8900.00, 'Cr'),
('LED-024', 'Sri Sai Linen & Guest Amenities', 'Sundry Creditors', 24000.00, 24000.00, 'Cr'),
('LED-030', 'Room Accommodation Revenue (SAC 996311)', 'Direct Incomes', 1485000.00, 1485000.00, 'Cr'),
('LED-031', 'Cannon Restaurant Dining (SAC 996331)', 'Direct Incomes', 412500.00, 412500.00, 'Cr'),
('LED-032', 'Banquet & Conference Hall Revenue', 'Direct Incomes', 195000.00, 195000.00, 'Cr'),
('LED-040', 'Kitchen Raw Materials & Groceries', 'Direct Expenses', 185000.00, 185000.00, 'Dr'),
('LED-041', 'Diesel Generator Fuel & Oil', 'Indirect Expenses', 42500.00, 42500.00, 'Dr'),
('LED-042', 'Hotel Electricity Bills (TPCODL)', 'Indirect Expenses', 89400.00, 89400.00, 'Dr'),
('LED-043', 'Staff Salaries & Overtime Wages', 'Indirect Expenses', 345000.00, 345000.00, 'Dr'),
('LED-050', 'Output Central GST 2.5%', 'Duties & Taxes', 28400.00, 28400.00, 'Cr'),
('LED-051', 'Output State GST 2.5%', 'Duties & Taxes', 28400.00, 28400.00, 'Cr'),
('LED-052', 'Input Tax Credit CGST (Purchases)', 'Duties & Taxes', 14200.00, 14200.00, 'Dr'),
('LED-053', 'Input Tax Credit SGST (Purchases)', 'Duties & Taxes', 14200.00, 14200.00, 'Dr'),
('LED-054', 'TDS Payable u/s 194C / 194J', 'Duties & Taxes', 6500.00, 6500.00, 'Cr');

-- 13. SEED INITIAL DAYBOOK BALANCED VOUCHERS
INSERT OR IGNORE INTO tally_vouchers (voucher_no, voucher_type, type_code, voucher_date, ref_no, narration, total_debit, total_credit, is_balanced) VALUES
('HSI/RCP/2627-0481', 'Receipt', 'F6', '2026-09-26', 'ROOM-301-SETTLE', 'Settlement of Room 301 (Mr. P Ashok) CP Package bill FMBIL2627-01499 via PhonePe UPI', 10588.60, 10588.60, 1),
('HSI/CNT/2627-0104', 'Contra', 'F4', '2026-09-26', 'BANK-DEP-0926', 'Cash deposit from Front Desk cash drawer into SBI Current A/c (Denom: 500x30, 200x25)', 20000.00, 20000.00, 1),
('HSI/PAY/2627-0312', 'Payment', 'F5', '2026-09-25', 'MANDI-SEPT-W4', 'Payment to Rayagada Mandi for morning delivery of fresh vegetables & potatoes', 3450.00, 3450.00, 1),
('HSI/JRN/2627-0089', 'Journal', 'F7', '2026-09-25', 'ASHOK-TDS-ADJ', 'TDS Deduction 2% by Ashok Leyland Ltd on corporate conference catering bill u/s 194C', 4290.00, 4290.00, 1);

-- 14. SEED VOUCHER LINE ITEMS
INSERT OR IGNORE INTO tally_voucher_lines (line_id, voucher_no, dr_cr, ledger_id, ledger_name, amount, line_order) VALUES
('VL-001-1', 'HSI/RCP/2627-0481', 'Dr', 'LED-005', 'PhonePe Merchant UPI QR', 10588.60, 1),
('VL-001-2', 'HSI/RCP/2627-0481', 'Cr', 'LED-030', 'Room Accommodation Revenue (SAC 996311)', 9003.91, 2),
('VL-001-3', 'HSI/RCP/2627-0481', 'Cr', 'LED-031', 'Cannon Restaurant Dining (SAC 996331)', 1080.47, 3),
('VL-001-4', 'HSI/RCP/2627-0481', 'Cr', 'LED-050', 'Output Central GST 2.5%', 252.11, 4),
('VL-001-5', 'HSI/RCP/2627-0481', 'Cr', 'LED-051', 'Output State GST 2.5%', 252.11, 5),
('VL-002-1', 'HSI/CNT/2627-0104', 'Dr', 'LED-003', 'SBI Current A/c 49281', 20000.00, 1),
('VL-002-2', 'HSI/CNT/2627-0104', 'Cr', 'LED-001', 'Front Desk Cash Drawer', 20000.00, 2),
('VL-003-1', 'HSI/PAY/2627-0312', 'Dr', 'LED-020', 'Rayagada Mandi Fresh Vegetables', 3450.00, 1),
('VL-003-2', 'HSI/PAY/2627-0312', 'Cr', 'LED-002', 'Hotel Petty Cash Safe', 3450.00, 2),
('VL-004-1', 'HSI/JRN/2627-0089', 'Dr', 'LED-054', 'TDS Payable u/s 194C / 194J', 4290.00, 1),
('VL-004-2', 'HSI/JRN/2627-0089', 'Cr', 'LED-010', 'Ashok Leyland Limited', 4290.00, 2);

-- 15. SEED INITIAL AUTHENTIC GST FOM RECORDS
INSERT OR IGNORE INTO gst_fom_records (record_id, bill_no, bill_date, ref_no, guest_name, room_number, company_name, gstin, billing_address, state_code, taxable_0, taxable_5, cgst, sgst, total_amount) VALUES
('FOM-001', 'FMBIL2627-01440', '2026-09-25', '654', 'MR P ASHOK', '301', 'Ashok Leyland Limited', '33AAACA0779M1ZT', 'Chennai, Tamil Nadu', '33 (Tamil Nadu / IGST)', 8400.00, 0.00, 0.00, 0.00, 8400.00),
('FOM-002', 'FMBIL2627-01441', '2026-09-25', '655', 'LAVAKANTA OJHA', '204', 'Akchem Synthetics', '21AABCA1234D1Z2', 'Bhubaneswar, Odisha', '21 (Odisha)', 2999.00, 450.00, 11.25, 11.25, 3471.50),
('FOM-003', 'FMBIL2627-01442', '2026-09-25', '656', 'BIJAY PASWAN', '108', 'PRADAN NGO', '21AAATP0912K1Z3', 'Rayagada, Odisha', '21 (Odisha)', 1699.00, 280.00, 7.00, 7.00, 1993.00),
('FOM-004', 'FMBIL2627-01443', '2026-09-25', '657', 'UTKARSH SRIVASTAVA', '302', 'Direct Guest', '', 'Varanasi, Uttar Pradesh', '09 (Uttar Pradesh)', 2464.00, 520.00, 13.00, 13.00, 3010.00);

-- 16. SEED INITIAL STATION / INDUSTRIAL PLANT TRANSFERS
INSERT OR IGNORE INTO guest_transfers (transfer_id, guest_name, room_number, phone, transfer_type, train_number, scheduled_time, pickup_location, assigned_vehicle, driver_name, driver_phone, fare, is_corporate_courtesy, billing_status, dispatch_status) VALUES
('TRF-901', 'MR. P ASHOK (Linde India)', '301', '+91 6305202068', 'Station Pickup (RGDA)', '12807 Samata Express', '06:15 AM', 'Rayagada Railway Station (PF 1)', 'Innova Crysta (OD-18-B-4402)', 'Santosh Kumar', '+91 94371 55210', 350.00, 1, 'Billed to Room Folio (SAC 996412)', 'Completed'),
('TRF-902', 'BIJAY PASWAN (Utkal Alumina)', '204', '+91 98490 12044', 'Industrial Plant Transfer', 'N/A (Tikiri Site Visit)', '09:30 AM', 'Hotel Sai Lobby Porch', 'Swift Dzire (OD-18-A-1109)', 'Rabi Narayan Panda', '+91 94380 99411', 1200.00, 0, 'Billed to Room Folio (SAC 996412)', 'Driver Dispatched'),
('TRF-903', 'UTKARSH SRIVASTAVA', '302', '+91 94370 88912', 'Station Drop (RGDA)', '20833 Vande Bharat Express', '02:45 PM', 'Hotel Sai Lobby Porch', 'Innova Crysta (OD-18-B-4402)', 'Santosh Kumar', '+91 94371 55210', 350.00, 0, 'Pending Settlement', 'Scheduled');
