-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA, ODISHA (PIN: 765001)
-- CLOUDFLARE D1 RELATIONAL SQL DATABASE SCHEMA (39 PRODUCTION TABLES)
-- ============================================================================

-- 1. ROOMS (40 ROOM INVENTORY ACROSS 4 FLOORS)
CREATE TABLE IF NOT EXISTS rooms (
  room_number TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('Standard Deluxe', 'Deluxe Room', 'Executive Room', 'Premium Suite')),
  room_type TEXT NOT NULL DEFAULT 'EXEDEL',
  floor INTEGER NOT NULL CHECK (floor BETWEEN 1 AND 4),
  tariff REAL NOT NULL,
  outstanding_balance REAL NOT NULL DEFAULT 0,
  capacity_adults INTEGER NOT NULL,
  capacity_children INTEGER NOT NULL DEFAULT 1,
  bed_type TEXT NOT NULL,
  pax TEXT NOT NULL DEFAULT '1 Pax',
  amenities TEXT NOT NULL, -- JSON array string
  status TEXT NOT NULL CHECK (status IN ('Available', 'Occupied', 'Cleaning', 'Maintenance', 'VIP Hold')) DEFAULT 'Available',
  current_guest_name TEXT,
  current_booking_id TEXT,
  last_cleaned_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  booking_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  id_proof_type TEXT NOT NULL, -- Aadhaar, Passport, Voter ID, Driving License
  id_proof_masked TEXT NOT NULL, -- XXXX-XXXX-1234
  state_of_origin TEXT NOT NULL DEFAULT 'Odisha',
  is_interstate INTEGER NOT NULL DEFAULT 0,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  nights INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  tariff_per_night REAL NOT NULL,
  base_total REAL NOT NULL,
  cgst REAL NOT NULL,
  sgst REAL NOT NULL,
  total_amount REAL NOT NULL,
  advance_deposit REAL NOT NULL DEFAULT 0,
  balance_due REAL NOT NULL,
  payment_mode TEXT NOT NULL, -- UPI, Cash, Card, NetBanking, Corporate B2B
  payment_status TEXT NOT NULL DEFAULT 'Pending Gateway Verification',
  booking_status TEXT NOT NULL DEFAULT 'Confirmed', -- Confirmed, Checked In, Checked Out, Cancelled
  is_b2b INTEGER NOT NULL DEFAULT 0,
  corporate_id TEXT,
  corporate_gstin TEXT,
  company_name TEXT,
  bill_no TEXT,
  check_in_time TEXT DEFAULT '12:00 PM',
  billing_address TEXT,
  billing_type TEXT DEFAULT 'Direct',
  meal_plan TEXT DEFAULT 'EP',
  grc_no TEXT,
  pax INTEGER DEFAULT 1,
  is_non_gst INTEGER DEFAULT 0,
  consent_dpdp INTEGER NOT NULL DEFAULT 1,
  special_requests TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- 3. FOOD ORDERS
CREATE TABLE IF NOT EXISTS food_orders (
  order_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  outlet TEXT NOT NULL DEFAULT 'Cannon Kitchen',
  items_json TEXT NOT NULL, -- JSON array of items
  subtotal REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  discount_reason TEXT,
  gst REAL NOT NULL,
  total_amount REAL NOT NULL,
  is_non_commercial INTEGER NOT NULL DEFAULT 0,
  nc_reason TEXT,
  captain_name TEXT,
  is_jain_satvik INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Received', -- Received, Preparing, Out for Delivery, Delivered, Billed to Room
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. ROOM SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS room_service_requests (
  request_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  service_type TEXT NOT NULL, -- Housekeeping, Linen Change, Extra Water, Toiletries, Luggage Assistance
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Normal', -- Low, Normal, High, Urgent
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, In Progress, Completed
  assigned_staff TEXT,
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- 5. STAFF
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Manager, Receptionist, Chef, Housekeeping, Security, Driver
  phone TEXT NOT NULL,
  shift TEXT NOT NULL DEFAULT 'Morning', -- Morning, Evening, Night
  monthly_salary REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  joined_date TEXT NOT NULL
);

-- 6. SALARY ADVANCES
CREATE TABLE IF NOT EXISTS salary_advances (
  advance_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  purpose TEXT,
  approved_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Approved',
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 7. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  expense_id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- Vegetables & Groceries, Linen & Laundry, Electricity & Utilities, Maintenance, Diesel Generator
  amount REAL NOT NULL,
  vendor_name TEXT,
  paid_by TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  record_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  date TEXT NOT NULL,
  shift TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Half Day', 'Leave')),
  check_in_time TEXT,
  check_out_time TEXT,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 9. LINEN INVENTORY
CREATE TABLE IF NOT EXISTS linen_inventory (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL, -- King Bed Sheet, Pillow Covers, Bath Towels, Duvet Covers, Hand Towels
  total_stock INTEGER NOT NULL,
  in_rooms INTEGER NOT NULL,
  in_laundry INTEGER NOT NULL,
  buffer_stock INTEGER NOT NULL,
  par_level INTEGER NOT NULL,
  last_audited TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. CHECKOUT INSPECTIONS
CREATE TABLE IF NOT EXISTS checkout_inspections (
  inspection_id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  key_returned INTEGER NOT NULL DEFAULT 1,
  minibar_consumed REAL NOT NULL DEFAULT 0,
  linen_damage REAL NOT NULL DEFAULT 0,
  room_damage REAL NOT NULL DEFAULT 0,
  notes TEXT,
  cleared_for_cleaning INTEGER NOT NULL DEFAULT 1,
  inspected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 11. HOTEL CONFIG
CREATE TABLE IF NOT EXISTS hotel_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 12. PAYROLL HISTORY
CREATE TABLE IF NOT EXISTS payroll_history (
  payroll_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- e.g. 2026-09
  gross_salary REAL NOT NULL,
  advances_deducted REAL NOT NULL DEFAULT 0,
  net_paid REAL NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'Bank Transfer',
  transaction_ref TEXT,
  paid_on TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 13. NIGHT AUDITS
CREATE TABLE IF NOT EXISTS night_audits (
  audit_id TEXT PRIMARY KEY,
  audit_date TEXT NOT NULL UNIQUE,
  total_rooms INTEGER NOT NULL DEFAULT 40,
  occupied_rooms INTEGER NOT NULL,
  occupancy_rate REAL NOT NULL,
  room_revenue REAL NOT NULL,
  pos_fnb_revenue REAL NOT NULL,
  other_revenue REAL NOT NULL,
  total_revenue REAL NOT NULL,
  cash_collected REAL NOT NULL,
  upi_collected REAL NOT NULL,
  card_collected REAL NOT NULL,
  corporate_billed REAL NOT NULL,
  discrepancy_amount REAL NOT NULL DEFAULT 0,
  auditor_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 14. CONSENT RECORDS (DPDP ACT 2023)
CREATE TABLE IF NOT EXISTS consent_records (
  consent_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  phone_or_email TEXT NOT NULL,
  purpose TEXT NOT NULL, -- Accommodation Registration & Police Register
  ip_address TEXT,
  user_agent TEXT,
  consent_granted INTEGER NOT NULL DEFAULT 1,
  consented_at TEXT NOT NULL DEFAULT (datetime('now')),
  purge_scheduled_at TEXT NOT NULL
);

-- 15. DATA RIGHTS REQUESTS (DPDP ACT 2023)
CREATE TABLE IF NOT EXISTS data_rights_requests (
  request_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('Access', 'Correction', 'Erasure', 'Grievance')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'Received', -- Received, Under Review, Completed, Rejected
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- 16. LOST AND FOUND
CREATE TABLE IF NOT EXISTS lost_and_found (
  item_id TEXT PRIMARY KEY,
  room_number TEXT,
  item_name TEXT NOT NULL,
  description TEXT,
  found_by TEXT NOT NULL,
  found_date TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'In Custody', -- In Custody, Claimed & Returned, Auctioned/Disposed
  claimed_by TEXT,
  claim_date TEXT
);

-- 17. CASHIER SHIFT HANDOVERS (FRONT DESK & POS CASH DRAWER BALANCING)
CREATE TABLE IF NOT EXISTS cashier_shift_handovers (
  handover_id TEXT PRIMARY KEY,
  shift_date TEXT NOT NULL,
  shift_type TEXT NOT NULL, -- Morning (07:00-15:00), Evening (15:00-23:00), Night (23:00-07:00), General Shift
  outgoing_cashier TEXT NOT NULL,
  incoming_cashier TEXT NOT NULL,
  opening_float REAL NOT NULL DEFAULT 5000,
  cash_sales REAL NOT NULL DEFAULT 0,
  petty_cash_paid REAL NOT NULL DEFAULT 0,
  cash_collected REAL NOT NULL DEFAULT 0,
  upi_collected REAL NOT NULL DEFAULT 0,
  card_collected REAL NOT NULL DEFAULT 0,
  corporate_credit REAL NOT NULL DEFAULT 0,
  total_revenue REAL NOT NULL DEFAULT 0,
  expected_drawer_cash REAL NOT NULL DEFAULT 0,
  actual_drawer_cash REAL NOT NULL DEFAULT 0,
  closing_cash_expected REAL NOT NULL DEFAULT 0,
  closing_cash_actual REAL NOT NULL DEFAULT 0,
  variance_amount REAL NOT NULL DEFAULT 0,
  variance REAL NOT NULL DEFAULT 0,
  discrepancy_reason TEXT,
  status TEXT NOT NULL DEFAULT 'BALANCED', -- 'BALANCED', 'SURPLUS', 'DEFICIT', 'Balanced', 'Discrepancy'
  verified_by TEXT NOT NULL DEFAULT 'Duty Manager',
  shift_lead TEXT DEFAULT 'Sudhakar Reddy',
  handover_signed INTEGER DEFAULT 1,
  signed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 18. STAFF ADJUSTMENTS
CREATE TABLE IF NOT EXISTS staff_adjustments (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Bonus', 'Incentive', 'Penalty', 'Overtime')),
  amount REAL NOT NULL,
  reason TEXT NOT NULL,
  month_year TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 19. FESTIVE PRICING RULES
CREATE TABLE IF NOT EXISTS festive_pricing_rules (
  rule_id TEXT PRIMARY KEY,
  festival_name TEXT NOT NULL, -- Chaiti Festival, Rath Yatra, Durga Puja, New Year, Shivaratri
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  multiplier REAL NOT NULL DEFAULT 1.25,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 20. POLICE REGISTER DISPATCHES (SARAI ACT 1867)
CREATE TABLE IF NOT EXISTS police_register_dispatches (
  dispatch_id TEXT PRIMARY KEY,
  dispatch_date TEXT NOT NULL,
  police_station TEXT NOT NULL DEFAULT 'Rayagada Town PS',
  total_entries INTEGER NOT NULL,
  interstate_entries INTEGER NOT NULL,
  foreign_entries INTEGER NOT NULL DEFAULT 0,
  dispatched_by TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'WhatsApp & Official Email',
  dispatch_status TEXT NOT NULL DEFAULT 'Dispatched',
  payload_preview TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 21. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('Percentage', 'Fixed')),
  discount_value REAL NOT NULL,
  min_booking_amount REAL NOT NULL DEFAULT 0,
  max_discount REAL,
  valid_until TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 22. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  item_id TEXT PRIMARY KEY,
  item_code TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Breakfast, Odia Delicacies, Starters, Main Course, Satvik & Jain, Beverages, GAIL Corporate Meals
  price REAL NOT NULL,
  is_veg INTEGER NOT NULL DEFAULT 1,
  is_jain INTEGER NOT NULL DEFAULT 0,
  is_special INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_available INTEGER NOT NULL DEFAULT 1
);

-- 23. SPIRITUAL SERVICES
CREATE TABLE IF NOT EXISTS spiritual_services (
  service_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km REAL NOT NULL,
  timing_info TEXT NOT NULL,
  description TEXT NOT NULL,
  transport_tariff REAL NOT NULL
);

-- 24. GUEST REVIEWS
CREATE TABLE IF NOT EXISTS guest_reviews (
  review_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_city TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_stay INTEGER NOT NULL DEFAULT 1,
  room_tier TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 25. BIOMETRIC LOGS
CREATE TABLE IF NOT EXISTS biometric_logs (
  log_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('IN', 'OUT')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  terminal_id TEXT NOT NULL DEFAULT 'TERM-FRONT-01'
);

-- 26. EXPENSE CATEGORIES
CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  monthly_budget REAL NOT NULL DEFAULT 50000
);

-- 27. CORPORATE PARTNERS
CREATE TABLE IF NOT EXISTS corporate_partners (
  corporate_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  gstin TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contracted_discount_percent REAL NOT NULL DEFAULT 15,
  preferred_tier TEXT NOT NULL DEFAULT 'Executive Room',
  credit_days INTEGER NOT NULL DEFAULT 30,
  credit_limit REAL NOT NULL DEFAULT 200000,
  opening_balance REAL NOT NULL DEFAULT 0,
  billing_mode TEXT DEFAULT 'Room Only',
  status TEXT NOT NULL DEFAULT 'Active'
);

-- 28. ROOM SERVICE CATALOG
CREATE TABLE IF NOT EXISTS room_service_catalog (
  service_code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Amenities, Housekeeping, Station Transit, Laundry
  chargeable REAL NOT NULL DEFAULT 0,
  turnaround_minutes INTEGER NOT NULL DEFAULT 20
);

-- 29. SECURITY INCIDENTS
CREATE TABLE IF NOT EXISTS security_incidents (
  incident_id TEXT PRIMARY KEY,
  incident_date TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  resolution_status TEXT NOT NULL DEFAULT 'Logged'
);

-- 30. ROOM HOLDS (RATE-LIMIT PROTECTED WITH 10-MIN EXPIRY)
CREATE TABLE IF NOT EXISTS room_holds (
  hold_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  session_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 31. DEVOTEE LEADS
CREATE TABLE IF NOT EXISTS devotee_leads (
  lead_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pilgrimage_group_size INTEGER NOT NULL DEFAULT 2,
  planned_darshan_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 32. WHATSAPP DISPATCH LOGS
CREATE TABLE IF NOT EXISTS whatsapp_dispatch_logs (
  log_id TEXT PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  template_type TEXT NOT NULL, -- PoliceRegister, BookingConfirmation, Invoice, ShiftHandover
  message_preview TEXT NOT NULL,
  dispatch_status TEXT NOT NULL DEFAULT 'Sent',
  dispatched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 33. CRON EXECUTION LOGS
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  log_id TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  status TEXT NOT NULL, -- SUCCESS, FAILED, SKIPPED
  summary TEXT NOT NULL,
  executed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 34. AI CONCIERGE INTERACTIONS
CREATE TABLE IF NOT EXISTS ai_concierge_interactions (
  interaction_id TEXT PRIMARY KEY,
  user_prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 35. ROOM ALLOCATION MUTEX LOGS
CREATE TABLE IF NOT EXISTS room_allocation_mutex_logs (
  mutex_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  status TEXT NOT NULL, -- ACQUIRED, RELEASED, COLLISION_DETECTED
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 36. POLICE GUEST ENTRIES (LOCAL SARAI REGISTER)
CREATE TABLE IF NOT EXISTS police_guest_entries (
  entry_id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number_masked TEXT NOT NULL,
  state_origin TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  purpose_of_visit TEXT NOT NULL DEFAULT 'Business / Pilgrimage',
  dispatch_status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 37. DPDP ACCESS LOGS
CREATE TABLE IF NOT EXISTS dpdp_access_logs (
  log_id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL, -- VIEW_PII, EXPORT_REGISTER, PURGE_CONSENT, LOG_GRIEVANCE
  resource_id TEXT,
  details TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 38. CORPORATE B2B INVOICES
CREATE TABLE IF NOT EXISTS corporate_b2b_invoices (
  invoice_number TEXT PRIMARY KEY,
  corporate_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  sac_code TEXT NOT NULL DEFAULT '996311',
  taxable_value REAL NOT NULL,
  cgst_rate REAL NOT NULL DEFAULT 2.5,
  cgst_amount REAL NOT NULL,
  sgst_rate REAL NOT NULL DEFAULT 2.5,
  sgst_amount REAL NOT NULL,
  total_invoice_value REAL NOT NULL,
  payment_terms TEXT NOT NULL DEFAULT 'Net 30 Days',
  status TEXT NOT NULL DEFAULT 'Issued',
  issued_date TEXT NOT NULL,
  due_date TEXT NOT NULL
);

-- 39. QR STANDEE TELEMETRY
CREATE TABLE IF NOT EXISTS qr_standee_telemetry (
  telemetry_id TEXT PRIMARY KEY,
  standee_location TEXT NOT NULL, -- Reception Standee, Dining Table Standee, 3D Map Standee, Elevator Lobbies
  scans_count INTEGER NOT NULL DEFAULT 1,
  last_scan_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 40. FOLIO TRANSACTIONS (IDS NEXT IMMUTABLE DOUBLE-ENTRY MASTER LEDGER)
CREATE TABLE IF NOT EXISTS folio_transactions (
  transaction_id TEXT PRIMARY KEY,
  folio_id TEXT NOT NULL,
  booking_id TEXT,
  room_number TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Room Charge', 'Food & Beverage', 'Bar', 'Room Service', 'Laundry', 'Minibar', 'Extra Bed', 'Payment', 'Discount', 'Allowance')),
  outlet TEXT NOT NULL DEFAULT 'Front Desk', -- Front Desk, Cannon Kitchen, Bar Outlet, Room Service, Laundry Dept
  item_code TEXT,
  description TEXT NOT NULL,
  debit_amount REAL NOT NULL DEFAULT 0,  -- Charges to guest account
  credit_amount REAL NOT NULL DEFAULT 0, -- Payments / deposits / allowances
  taxable_base REAL NOT NULL DEFAULT 0,
  gst_rate REAL NOT NULL DEFAULT 0, -- 0, 5, 12, 18
  cgst REAL NOT NULL DEFAULT 0,
  sgst REAL NOT NULL DEFAULT 0,
  sac_code TEXT NOT NULL DEFAULT '996311', -- 996311 (Accommodation 12%), 996331 (Restaurant F&B 5%)
  invoice_id TEXT, -- Target split invoice: e.g. INV-ROOM-402 or INV-FOOD-402
  payment_mode TEXT DEFAULT 'Cash',
  rule48_copy TEXT DEFAULT 'ORIGINAL FOR RECIPIENT',
  is_locked INTEGER NOT NULL DEFAULT 0, -- 1 = Frozen by 12:00 AM Night Audit
  created_by TEXT NOT NULL DEFAULT 'Reception Cashier',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- 41. SPLIT PAYMENTS (MULTI-TENDER SINGLE INVOICE SETTLEMENT)
CREATE TABLE IF NOT EXISTS split_payments (
  payment_id TEXT PRIMARY KEY,
  folio_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Corporate Credit', 'Cheque', 'Bank Transfer NEFT')),
  amount REAL NOT NULL,
  reference_utr TEXT, -- UTR/Cheque/POS Approval Code
  cashier_name TEXT NOT NULL,
  shift_type TEXT NOT NULL DEFAULT 'Morning',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 42. CORPORATE LEDGER (STATEMENT OF ACCOUNT WITH TDS SECTION 194C / 194I)
CREATE TABLE IF NOT EXISTS corporate_ledger (
  entry_id TEXT PRIMARY KEY,
  corporate_id TEXT NOT NULL,
  entry_date TEXT NOT NULL DEFAULT (date('now')),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('Invoice Debit', 'Bank NEFT Credit', 'Cheque Credit', 'TDS Deduction Credit', 'Credit Note')),
  invoice_id TEXT,
  description TEXT NOT NULL,
  debit_amount REAL NOT NULL DEFAULT 0,   -- Bill to Company transfers
  credit_amount REAL NOT NULL DEFAULT 0,  -- Payments received / TDS
  tds_section TEXT, -- 194C (Contractor 1-2%), 194I (Rent/Hotel 2-10%)
  tds_amount REAL NOT NULL DEFAULT 0,
  running_balance REAL NOT NULL,
  bank_ref TEXT,
  cleared_status TEXT NOT NULL DEFAULT 'Cleared',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (corporate_id) REFERENCES corporate_partners(corporate_id)
);

-- 43. NIGHT AUDIT LOG (12:00 AM HARD-LOCK & BUSINESS DATE ROLLOVER)
CREATE TABLE IF NOT EXISTS night_audit_log (
  audit_id TEXT PRIMARY KEY,
  business_date TEXT NOT NULL UNIQUE,
  closed_at TEXT NOT NULL DEFAULT (datetime('now')),
  total_rooms INTEGER NOT NULL DEFAULT 40,
  occupied_rooms INTEGER NOT NULL,
  occupancy_pct REAL NOT NULL,
  adr REAL NOT NULL,
  revpar REAL NOT NULL,
  room_revenue REAL NOT NULL,
  fnb_revenue REAL NOT NULL,
  other_revenue REAL NOT NULL,
  gross_revenue REAL NOT NULL,
  cash_collected REAL NOT NULL,
  upi_collected REAL NOT NULL,
  card_collected REAL NOT NULL,
  company_billed REAL NOT NULL,
  cash_opening_float REAL NOT NULL,
  cash_expected REAL NOT NULL,
  cash_physical_drawer REAL NOT NULL,
  cash_variance REAL NOT NULL DEFAULT 0,
  is_locked INTEGER NOT NULL DEFAULT 1,
  auditor_name TEXT NOT NULL,
  notes TEXT
);

-- 44. STORE PURCHASES (MANDI RAW MATERIALS INWARD & VENDOR CREDIT)
CREATE TABLE IF NOT EXISTS store_purchases (
  purchase_id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL, -- Rayagada Mandi Traders, Maa Majhighariani Dairy, Utkal Poultry
  invoice_no TEXT,
  purchase_date TEXT NOT NULL DEFAULT (date('now')),
  category TEXT NOT NULL CHECK (category IN ('Vegetables', 'Poultry & Meat', 'Dairy & Paneer', 'Groceries & Rice', 'Spices & Oils', 'Packaging & Disposables')),
  items_summary TEXT NOT NULL,
  total_amount REAL NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Cash Paid', 'UPI Paid', 'Credit Payable')),
  received_by TEXT NOT NULL DEFAULT 'Kitchen Store Incharge',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 45. KITCHEN REQUISITIONS (STORE TO CANNON KITCHEN ISSUE VOUCHER)
CREATE TABLE IF NOT EXISTS kitchen_requisitions (
  requisition_id TEXT PRIMARY KEY,
  issue_date TEXT NOT NULL DEFAULT (date('now')),
  target_outlet TEXT NOT NULL DEFAULT 'Cannon Kitchen',
  item_name TEXT NOT NULL,
  quantity_issued REAL NOT NULL,
  unit TEXT NOT NULL, -- kg, liters, packets, crates
  approx_cost REAL NOT NULL,
  issued_to TEXT NOT NULL, -- Head Chef
  issued_by TEXT NOT NULL DEFAULT 'Store Manager',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- HOTEL CONFIG
INSERT OR IGNORE INTO hotel_config (key, value, description) VALUES
('hotel_name', 'Sri Sai Vasudev Residency', 'Official Trade Name'),
('legal_name', 'PAIDISETTY MANMADHA RAO', 'Official Legal Entity Name'),
('proprietor', 'Paidisetty Manmadha Rao', 'Proprietor Name'),
('constitution', 'Proprietorship', 'Constitution of Business'),
('hotel_address', 'Near Andhra Bank, New Colony, Rayagada, Odisha - 765001', 'Official Address'),
('phone', '+91 8895225555', 'Primary Reception Switchboard'),
('landline', '06856 225 555', 'Reception Landline Desk'),
('email', 'saisaivasudevresidency@gmail.com', 'Official Reservations Email'),
('gstin', '21AEKPP8689J1ZS', 'Odisha State GST Identification Number'),
('pan', 'AEKPP8689J', 'Permanent Account Number'),
('ownerPin', '7650', 'Back-office Admin Verification PIN'),
('upi_id', 'saisaivasudevresidency@sbi', 'Official SBI Merchant VPA'),
('check_in_time', '12:00 PM', 'Standard Daily Check-in'),
('check_out_time', '12:00 PM', 'Standard Daily Check-out (24-Hr Cycle)');

-- 40 ROOMS INVENTORY (10 PER TIER ACROSS 4 FLOORS)
-- Floor 1: Standard Deluxe (101 - 110)
INSERT OR IGNORE INTO rooms (room_number, tier, floor, tariff, capacity_adults, capacity_children, bed_type, amenities, status) VALUES
('101', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('102', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('103', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('104', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Occupied'),
('105', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('106', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Cleaning'),
('107', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('108', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('109', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('110', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),

-- Floor 2: Deluxe Room (201 - 210)
('201', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('202', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('203', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('204', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('205', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Cleaning'),
('206', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('207', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('208', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('209', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('210', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),

-- Floor 3: Executive Room (301 - 310)
('301', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('302', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('303', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('304', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('305', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Maintenance'),
('306', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('307', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('308', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'VIP Hold'),
('309', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('310', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),

-- Floor 4: Premium Suite (401 - 410)
('401', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('402', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('403', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('404', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('405', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('406', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Cleaning'),
('407', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('408', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('409', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('410', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'VIP Hold');

-- CORPORATE PARTNERS (RAYAGADA MAJOR INDUSTRIAL HUBS - 12 REGISTERED CLIENTS)
INSERT OR IGNORE INTO corporate_partners (
  corporate_id, company_name, gstin, location, contact_person,
  contact_email, contact_phone, contracted_discount_percent, preferred_tier,
  credit_days, credit_limit, opening_balance, status
) VALUES
('CORP-01', 'JK Paper Mills Ltd.', '21AAACJ1288P1ZZ', 'Jaykaypur, Rayagada', 'Subrat Panda (Admin GM)', 'admin.jk@jkpaper.com', '+91 6856 222000', 15, 'Executive Room', 30, 500000, 142500, 'Active'),
('CORP-02', 'GAIL (India) Limited', '07AAACG1509J1ZQ', 'Pipeline Regional Office, Rayagada', 'Rajeshwar Rao', 'travel.gail@gail.co.in', '+91 6856 228811', 15, 'Executive Room', 30, 400000, 86400, 'Active'),
('CORP-03', 'Mahindra & Mahindra Ltd.', '27AAACM1545A1Z4', 'Automotive Logistics, Rayagada', 'Sunil K. Verma', 'verma.sunil@mahindra.com', '+91 6856 229944', 12, 'Deluxe Room', 30, 300000, 48200, 'Active'),
('CORP-04', 'Hindustan Coca-Cola Beverages', '21AAACH1123P1Z9', 'South Odisha Distribution Hub', 'Amitabh Sen', 'traveldesk@hccb.co.in', '+91 6856 231122', 10, 'Executive Room', 30, 250000, 32000, 'Active'),
('CORP-05', 'IMFA (Indian Metals & Ferro Alloys)', '21AAACI0981M1Z5', 'Therubali, Rayagada', 'D. K. Mohapatra (VP HR)', 'traveldesk@imfa.in', '+91 6856 233444', 15, 'Executive Room', 30, 600000, 118000, 'Active'),
('CORP-06', 'Utkal Alumina International Ltd.', '21AABCU5544N1ZV', 'Doraguda, Rayagada', 'Manish Agrawal (Corporate Logistics)', 'logistics@utkalalumina.adityabirla.com', '+91 6856 244555', 20, 'Premium Suite', 45, 800000, 215000, 'Active'),
('CORP-07', 'East Coast Railway (ECoR) Rayagada Div.', '21AAAGR0022E1Z8', 'Station Road, Rayagada', 'P. K. Nayak (Sr. DSTE)', 'travel.rgda@ecor.railnet.gov.in', '+91 6856 223311', 12, 'Executive Room', 30, 450000, 65400, 'Active'),
('CORP-08', 'PRADAN', '21AAATP0912K1Z3', 'J K Pur, Rayagada', 'Bijay Paswan', 'rayagada@pradan.net', '+91 7209347755', 15, 'Executive Room', 30, 350000, 48900, 'Active'),
('CORP-09', 'Ashok Leyland Limited', '33AAACA0779M1ZT', 'Commercial Vehicle Service Division, Rayagada', 'Malay Panda', 'service.odisha@ashokleyland.com', '+91 6856 226688', 18, 'Executive Room', 45, 500000, 214487, 'Active'),
('CORP-10', 'Easy Note Stationary Pvt Ltd', '21AABCE9876R1Z2', 'Rayagada Industrial Area', 'Mriganka Dasgupta', 'accounts@easynote.in', '+91 94370 55441', 10, 'Executive Room', 30, 200000, 28400, 'Active'),
('CORP-11', 'Incredible Dreams Hotels & Resorts', '21AACCI7788P1Z5', 'Regional Hospitality Partner', 'Prabhu Prasad Padhy', 'travel@incredibledreams.co.in', '+91 98610 33221', 15, 'Executive Room', 30, 250000, 36200, 'Active'),
('CORP-12', 'Linde India Ltd', '21AAACB2528H1ZA', 'J.K. Paper Mill Plant Site, Jaykaypur, Rayagada', 'P. Ashok', 'p.ashok@linde.com', '+91 6305202068', 15, 'Executive Room', 30, 400000, 13558, 'Active');

-- SPIRITUAL & REGIONAL SERVICES
INSERT OR IGNORE INTO spiritual_services (service_id, title, destination, distance_km, timing_info, description, transport_tariff) VALUES
('SPIRIT-01', 'Maa Majhighariani Temple Darshan', 'Maa Majhighariani Mandir, Rayagada', 2.0, '05:00 AM - 01:00 PM & 04:00 PM - 09:00 PM (Wed/Fri Special)', 'Famous shrine where Goddess Majhighariani fulfills wishes. Priority pickup and darshan guide.', 350.00),
('SPIRIT-02', 'Maa Kali Mandir & Devagiri Cave Excursion', 'Devagiri Hill, Kalyansinghpur', 38.0, '07:00 AM - 05:00 PM', 'Sacred cave atop 120m hill with ancient Shivalinga and water perennial spring.', 1800.00),
('SPIRIT-03', 'Jagannath Temple Darshan', 'Raniguda Farm, Rayagada', 3.5, '06:00 AM - 12:00 PM & 05:00 PM - 08:30 PM', 'Magnificent temple replicating Puri Jagannath traditions in South Odisha.', 450.00);

-- LINEN INVENTORY
INSERT OR IGNORE INTO linen_inventory (id, item_name, total_stock, in_rooms, in_laundry, buffer_stock, par_level) VALUES
('LIN-01', 'King Bed Sheets (300 TC)', 160, 48, 42, 70, 120),
('LIN-02', 'Pillow Covers (Percale)', 200, 80, 50, 70, 160),
('LIN-03', 'Premium Bath Towels (650 GSM)', 140, 50, 35, 55, 100),
('LIN-04', 'Hand & Face Towels', 150, 45, 40, 65, 110),
('LIN-05', 'Microfiber Duvet Covers', 80, 40, 18, 22, 60);

-- MENU ITEMS (AUTHENTIC CANNON KITCHEN & MYSOFT POS 85 ITEMS)
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-116', '116', 'ANDHRA CHICKEN', 'Chicken Specialities', 260.00, 0, 0, 1, 'Spicy Andhra style country chicken roasted with crushed peppercorns and curry leaves.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-164', '164', 'APOLLO FISH', 'Mutton & Seafood', 350.00, 0, 0, 1, 'Boneless fish fillets marinated with spiced yogurt, deep fried and tempered in South Indian spices.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-229', '229', 'BABY CORN MASALA', 'Paneer & Veg Delicacies', 180.00, 1, 0, 0, 'Tender baby corn spears simmered in seasoned onion-tomato gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-156', '156', 'BOILED EGG ( 2pcs)', 'Egg Delicacies', 60.00, 0, 0, 0, 'Two farm-fresh eggs hard boiled and served with rock salt and pepper.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-347', '347', 'BUTTER NAAN', 'Tandoori & Breads', 50.00, 1, 0, 0, 'Refined flour bread baked in tandoor and basted with generous melted butter.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-110', '110', 'CHICKEN CURRY', 'Chicken Specialities', 240.00, 0, 0, 0, 'Homestyle chicken cooked with aromatic Odisha spices in rich gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-114', '114', 'CHICKEN DO-PYAZA', 'Chicken Specialities', 260.00, 0, 0, 0, 'Chicken pieces tossed with double the quantity of browned and cubed onions.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-306', '306', 'CHICKEN FRIED RICE', 'Rice & Biryani', 250.00, 0, 0, 0, 'Wok tossed long grain rice with tender diced chicken, eggs, and spring onions.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-21', '21', 'CHICKEN HOT & SOUR SOUP', 'Soups & Starters', 140.00, 0, 0, 0, 'Classic Indo-Chinese sour and peppery soup with shredded chicken.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-115', '115', 'CHICKEN HYDERABADI', 'Chicken Specialities', 260.00, 0, 0, 1, 'Rich chicken gravy enriched with fresh spinach, coriander, and mint puree.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-127', '127', 'CHICKEN KASHA', 'Chicken Specialities', 240.00, 0, 0, 1, 'Traditional slow-roasted semi-gravy chicken with caramelized onions and whole spices.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-290', '290', 'CHICKEN LOLLIPOP', 'Soups & Starters', 270.00, 0, 0, 1, 'Crisp fried chicken winglets tossed in fiery Schezwan glaze.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-140', '140', 'CHICKEN PATIALA', 'Chicken Specialities', 240.00, 0, 0, 0, 'Punjabi style creamy chicken preparation topped with egg omelette ribbon.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-125', '125', 'CHICKEN SANGRILLA', 'Chicken Specialities', 280.00, 0, 0, 1, 'Chef signature fusion boneless chicken wok tossed with bell peppers and sweet tangy sauce.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-131', '131', 'CHICKEN TIKKA MASALA', 'Chicken Specialities', 380.00, 0, 0, 1, 'Clay oven smoked chicken tikka chunks in luscious makhani tomato reduction.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-284', '284', 'CHICKEN WINGS', 'Soups & Starters', 260.00, 0, 0, 0, 'Crispy spiced marinated chicken wings served with hot garlic dip.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-119', '119', 'CHILLI CHICKEN', 'Soups & Starters', 250.00, 0, 0, 1, 'All-time favorite wok-tossed battered chicken with green chillies, garlic, and soy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-33', '33', 'CHILLI MUSHROOM', 'Soups & Starters', 230.00, 1, 0, 1, 'Fresh Rayagada button mushrooms tossed with crunchy capsicum in chilli soy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-28', '28', 'CHILLI PANEER', 'Soups & Starters', 220.00, 1, 0, 0, 'Cubes of tender paneer wok-fried with onions, capsicum, and oriental sauces.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-294', '294', 'CHILLI PRAWN', 'Mutton & Seafood', 350.00, 0, 0, 1, 'Succulent fresh prawns wok-tossed in spicy chilli garlic sauce.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-11', '11', 'CURD CUP', 'Rice & Accompaniments', 35.00, 1, 1, 0, 'Fresh chilled set curd.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-194', '194', 'CURD RICE', 'Rice & Biryani', 150.00, 1, 1, 0, 'Comforting south-style curd rice tempered with mustard, curry leaves, and pomegranate.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-191', '191', 'DAL FRY', 'Dal & Curries', 120.00, 1, 0, 0, 'Yellow toor lentils cooked smooth and tempered with cumin, garlic, and ghee.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-335', '335', 'DAL KHICHDI', 'Rice & Biryani', 180.00, 1, 1, 0, 'Wholesome rice and yellow lentil porridge simmered with mild spices and ghee.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-198', '198', 'DAL TADAKA', 'Dal & Curries', 150.00, 1, 0, 0, 'Double tempered lentils with dried red chillies, garlic, and smoky hing.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-153', '153', 'EGG CURRY', 'Egg Delicacies', 260.00, 0, 0, 0, 'Hard boiled eggs simmered in spicy masala gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-159', '159', 'EGG FRIED RICE', 'Rice & Biryani', 210.00, 0, 0, 0, 'Fragrant rice stir-fried with scrambled eggs, scallions, and pepper.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-691', '691', 'EGG FRY', 'Egg Delicacies', 190.00, 0, 0, 0, 'Pan-seared spiced eggs with onions and green chillies.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-85', '85', 'EGG POACH / FRIED EGG', 'Egg Delicacies', 100.00, 0, 0, 0, 'Fresh sunny side up or poached egg.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-215', '215', 'EGG TADKA', 'Egg Delicacies', 180.00, 0, 0, 0, 'Dhaba style green moong lentils scrambled with spiced eggs.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-39', '39', 'FINGER CHIPS', 'Soups & Starters', 150.00, 1, 1, 0, 'Golden crispy french fries served with ketchup.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-167', '167', 'FISH FRY / ROST', 'Mutton & Seafood', 200.00, 0, 0, 1, 'Coastal spiced rava/masala fried freshwater fish darnes.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-232', '232', 'FRY PAPAD', 'Rice & Accompaniments', 30.00, 1, 1, 0, 'Deep fried crunchy urad dal papad.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-563', '563', 'GAIL BREAKFAST', 'GAIL Corporate Meals', 250.00, 1, 0, 1, 'Corporate executive breakfast buffet box contracted for GAIL India regional personnel.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-568', '568', 'GAIL N V DINNER', 'GAIL Corporate Meals', 480.00, 0, 0, 1, 'Special corporate non-veg dinner thali with chicken curry, breads, rice, and sweet.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-565', '565', 'GAIL N V LUNCH', 'GAIL Corporate Meals', 480.00, 0, 0, 1, 'Full corporate non-veg executive lunch spread for GAIL pipeline officers.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-566', '566', 'GAIL SNACKS', 'GAIL Corporate Meals', 170.00, 1, 0, 1, 'Evening tea-time hot savory snacks box for GAIL corporate desk.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-567', '567', 'GAIL VEG DINNER', 'GAIL Corporate Meals', 370.00, 1, 0, 1, 'Balanced vegetarian corporate dinner spread with paneer, dal, sabzi, phulkas, and rice.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-564', '564', 'GAIL VEG LUNCH', 'GAIL Corporate Meals', 370.00, 1, 0, 1, 'Executive vegetarian lunch box for visiting GAIL project engineers.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-192', '192', 'GARDEN FRESH SALAD', 'Rice & Accompaniments', 80.00, 1, 1, 0, 'Sliced cucumber, carrots, tomatoes, onions, and green chillies with lemon.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-287', '287', 'GARLIC CHICKEN', 'Chicken Specialities', 250.00, 0, 0, 0, 'Chicken cubes tossed with abundant roasted garlic and oriental seasonings.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-349', '349', 'GARLIC NAAN', 'Tandoori & Breads', 80.00, 1, 0, 1, 'Tandoor naan topped with minced roasted garlic, coriander, and butter.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-246', '246', 'GREEN PEAS FRY', 'Paneer & Veg Delicacies', 180.00, 1, 1, 0, 'Tender green peas sauteed with light cumin, ginger, and mild spices.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-30', '30', 'GREEN PEAS MASALA', 'Paneer & Veg Delicacies', 200.00, 1, 1, 0, 'Green peas simmered in a spiced onion-tomato gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-181', '181', 'KADAI PANEER', 'Paneer & Veg Delicacies', 240.00, 1, 0, 1, 'Cottage cheese and bell peppers cooked in freshly pounded coriander-chilli kadai masala.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-157', '157', 'MASALA OMELETTE', 'Egg Delicacies', 120.00, 0, 0, 0, 'Two eggs whisked with chopped onions, tomatoes, chillies, and pan-fried.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-36', '36', 'MASALA PAPAD', 'Rice & Accompaniments', 40.00, 1, 0, 0, 'Crispy roasted papad topped with tangy spiced onion, tomato, and coriander kachumber.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-175', '175', 'MIX VEG CURRY', 'Paneer & Veg Delicacies', 220.00, 1, 0, 0, 'Medley of seasonal vegetables cooked in traditional semi-dry curry gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-305', '305', 'MIXED FRIED RICE', 'Rice & Biryani', 300.00, 0, 0, 0, 'Wok-tossed rice with chicken, prawns, eggs, and crisp vegetables.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-266', '266', 'MUSHROOM DO PYAZA', 'Paneer & Veg Delicacies', 240.00, 1, 0, 1, 'Rayagada button mushrooms cooked with caramelized and diced onion chunks.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-95', '95', 'MUTTON CURRY', 'Mutton & Seafood', 370.00, 0, 0, 1, 'Tender goat meat slow simmered in traditional Odisha spicy clove and cinnamon gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-219', '219', 'PANEER BHARTHA', 'Paneer & Veg Delicacies', 240.00, 1, 0, 0, 'Freshly grated paneer cooked with green peas, tomatoes, and home spices.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-179', '179', 'PANEER BUTTER MASALA', 'Paneer & Veg Delicacies', 240.00, 1, 0, 1, 'Soft paneer cubes simmered in velvety butter tomato gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-222', '222', 'PANEER KAJU CURRY', 'Paneer & Veg Delicacies', 240.00, 1, 0, 1, 'Paneer cubes and roasted whole cashews simmered in a luscious creamy gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-183', '183', 'PANEER SHAHI KORMA', 'Paneer & Veg Delicacies', 270.00, 1, 1, 1, 'Royal white gravy preparation with paneer, melon seeds, and fragrant saffron.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-348', '348', 'PHULKA', 'Tandoori & Breads', 30.00, 1, 1, 0, 'Puffed whole wheat phulka made fresh on tawa.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-211', '211', 'PLAIN DAL', 'Dal & Curries', 100.00, 1, 1, 0, 'Simple boiled yellow lentils with pinch of turmeric and salt.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-61', '61', 'ROASTED PAPAD', 'Rice & Accompaniments', 25.00, 1, 1, 0, 'Fire roasted light papad.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-247', '247', 'SALT & PAPPER MUSHROOM', 'Soups & Starters', 230.00, 1, 0, 1, 'Crispy fried mushrooms tossed with freshly ground pepper and sea salt.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-54', '54', 'SALT & PEPPER CORN', 'Soups & Starters', 220.00, 1, 0, 0, 'Crispy american sweet corn kernels tossed with cracked pepper and scallions.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-88', '88', 'SALT & PEPPER PRAWN', 'Mutton & Seafood', 350.00, 0, 0, 1, 'Golden fried prawns dusted with salt, crushed black pepper, and garlic.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-120', '120', 'SPL CHICKEN FRIED RICE', 'Rice & Biryani', 300.00, 0, 0, 1, 'Cannon Kitchen special fried rice with double chicken chunks and chef secret sauce.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-307', '307', 'STEAM RICE', 'Rice & Biryani', 80.00, 1, 1, 0, 'Steamed aromatic long grain rice.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-346', '346', 'TANDOORI ROTI', 'Tandoori & Breads', 40.00, 1, 0, 0, 'Traditional clay oven whole wheat bread.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-343', '343', 'TANGDI KABAB ( 3Pcs )', 'Chicken Specialities', 450.00, 0, 0, 1, 'Chicken drumsticks marinated in rich cashew paste and tandoori spices, char-grilled.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-142', '142', 'TANGIDI MASALA', 'Chicken Specialities', 500.00, 0, 0, 1, 'Roasted chicken drumsticks simmered in spiced thick brown masala gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-341', '341', 'TD. CHICKEN ( Full )', 'Chicken Specialities', 500.00, 0, 0, 1, 'Whole spring chicken marinated overnight and roasted in traditional tandoor.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-109', '109', 'TD. CHICKEN ( Half )', 'Chicken Specialities', 300.00, 0, 0, 1, 'Half spring chicken roasted to smoky perfection in clay oven.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-312', '312', 'VEG FRIED RICE', 'Rice & Biryani', 180.00, 1, 0, 0, 'Classic wok-tossed basmati rice with finely diced carrots, beans, and cabbage.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-188', '188', 'VEG JALFREZI', 'Paneer & Veg Delicacies', 200.00, 1, 0, 0, 'Stir-fried seasonal vegetables in tangy spicy tomato-onion masala.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-217', '217', 'VEG KHAJANA', 'Paneer & Veg Delicacies', 250.00, 1, 0, 1, 'Assorted garden vegetables and paneer simmered in chef signature two-tone gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-18', '18', 'VEG MANCHOW SOUP', 'Soups & Starters', 120.00, 1, 0, 0, 'Spicy garlic-flavored dark vegetable soup topped with crispy fried noodles.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-27', '27', 'VEG MANCHURIAN', 'Soups & Starters', 220.00, 1, 0, 0, 'Crispy vegetable dumplings tossed in ginger, garlic, and dark soy gravy.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-42', '42', 'VEG NOODLES', 'Rice & Biryani', 200.00, 1, 0, 0, 'Hakka style wok-tossed noodles with shredded vegetables and white pepper.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-336', '336', 'VEG PULAO', 'Rice & Biryani', 150.00, 1, 1, 0, 'Fragrant basmati rice gently cooked with green peas, carrots, and whole spices.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-364', '364', 'BLACK TEA', 'Beverages', 25.00, 1, 1, 0, 'Pure brewed black tea with lemon wedge.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-372', '372', 'COLD DRINKS 200ml', 'Beverages', 25.00, 1, 1, 0, 'Chilled carbonated soft drinks bottle.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-367', '367', 'FRESH LIME SODA', 'Beverages', 40.00, 1, 1, 0, 'Freshly squeezed lime juice with sparkling club soda (sweet/salt/mixed).', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-654', '654', 'GAIL COFFEE', 'GAIL Corporate Meals', 15.00, 1, 1, 1, 'Hot filtered coffee served for GAIL corporate desk meetings.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-653', '653', 'GAIL TEA', 'GAIL Corporate Meals', 15.00, 1, 1, 1, 'Freshly brewed milk tea for GAIL corporate office staff.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-375', '375', 'MASALA COLD DRINK', 'Beverages', 40.00, 1, 1, 0, 'Chilled cola spiked with black salt, roasted cumin, and lemon.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-212', '212', 'MILK HOT OR COLD', 'Beverages', 60.00, 1, 1, 0, 'Glass of pure Rayagada dairy milk (hot or chilled).', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-373', '373', 'PACKED DRINK WATER', 'Beverages', 20.00, 1, 1, 0, 'Packaged sealed mineral water 1-litre bottle.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-374', '374', 'SODA 750ml', 'Beverages', 40.00, 1, 1, 0, 'Chilled 750ml soda pet bottle.', 1);
INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-1', '1', 'TEA', 'Beverages', 30.00, 1, 1, 0, 'Signature hot masala milk tea brewed with cardamom and ginger.', 1);

-- DAILY ITEM-WISE SALES (AUTHENTIC AUDITED REPORT 2026-09-24: TOTAL ₹67,846.00)
CREATE TABLE IF NOT EXISTS daily_item_sales (
  record_id TEXT PRIMARY KEY,
  report_date TEXT NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  section TEXT NOT NULL,
  category TEXT NOT NULL,
  total_qty INTEGER NOT NULL,
  unit_rate REAL NOT NULL,
  sales_amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-116', '2026-09-24', '116', 'ANDHRA CHICKEN', 'FOOD', 'Chicken Specialities', 1, 260.00, 260.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-164', '2026-09-24', '164', 'APOLLO FISH', 'FOOD', 'Mutton & Seafood', 1, 350.00, 350.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-229', '2026-09-24', '229', 'BABY CORN MASALA', 'FOOD', 'Paneer & Veg Delicacies', 1, 180.00, 180.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-156', '2026-09-24', '156', 'BOILED EGG ( 2pcs)', 'FOOD', 'Egg Delicacies', 1, 60.00, 60.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-347', '2026-09-24', '347', 'BUTTER NAAN', 'FOOD', 'Tandoori & Breads', 34, 50.00, 1745.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-110', '2026-09-24', '110', 'CHICKEN CURRY', 'FOOD', 'Chicken Specialities', 2, 240.00, 480.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-114', '2026-09-24', '114', 'CHICKEN DO-PYAZA', 'FOOD', 'Chicken Specialities', 2, 260.00, 520.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-306', '2026-09-24', '306', 'CHICKEN FRIED RICE', 'FOOD', 'Rice & Biryani', 2, 250.00, 500.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-21', '2026-09-24', '21', 'CHICKEN HOT & SOUR SOUP', 'FOOD', 'Soups & Starters', 2, 140.00, 280.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-115', '2026-09-24', '115', 'CHICKEN HYDERABADI', 'FOOD', 'Chicken Specialities', 6, 260.00, 1560.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-127', '2026-09-24', '127', 'CHICKEN KASHA', 'FOOD', 'Chicken Specialities', 1, 240.00, 240.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-290', '2026-09-24', '290', 'CHICKEN LOLLIPOP', 'FOOD', 'Soups & Starters', 2, 270.00, 540.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-140', '2026-09-24', '140', 'CHICKEN PATIALA', 'FOOD', 'Chicken Specialities', 1, 240.00, 240.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-125', '2026-09-24', '125', 'CHICKEN SANGRILLA', 'FOOD', 'Chicken Specialities', 4, 280.00, 1120.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-131', '2026-09-24', '131', 'CHICKEN TIKKA MASALA', 'FOOD', 'Chicken Specialities', 1, 380.00, 380.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-284', '2026-09-24', '284', 'CHICKEN WINGS', 'FOOD', 'Soups & Starters', 1, 260.00, 260.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-119', '2026-09-24', '119', 'CHILLI CHICKEN', 'FOOD', 'Soups & Starters', 4, 250.00, 1000.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-33', '2026-09-24', '33', 'CHILLI MUSHROOM', 'FOOD', 'Soups & Starters', 6, 230.00, 1380.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-28', '2026-09-24', '28', 'CHILLI PANEER', 'FOOD', 'Soups & Starters', 1, 220.00, 220.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-294', '2026-09-24', '294', 'CHILLI PRAWN', 'FOOD', 'Mutton & Seafood', 1, 350.00, 350.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-11', '2026-09-24', '11', 'CURD CUP', 'FOOD', 'Rice & Accompaniments', 1, 35.00, 35.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-194', '2026-09-24', '194', 'CURD RICE', 'FOOD', 'Rice & Biryani', 4, 150.00, 600.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-191', '2026-09-24', '191', 'DAL FRY', 'FOOD', 'Dal & Curries', 8, 120.00, 960.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-335', '2026-09-24', '335', 'DAL KHICHDI', 'FOOD', 'Rice & Biryani', 2, 180.00, 360.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-198', '2026-09-24', '198', 'DAL TADAKA', 'FOOD', 'Dal & Curries', 2, 150.00, 300.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-153', '2026-09-24', '153', 'EGG CURRY', 'FOOD', 'Egg Delicacies', 1, 260.00, 260.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-159', '2026-09-24', '159', 'EGG FRIED RICE', 'FOOD', 'Rice & Biryani', 2, 210.00, 420.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-691', '2026-09-24', '691', 'EGG FRY', 'FOOD', 'Egg Delicacies', 6, 190.00, 1140.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-85', '2026-09-24', '85', 'EGG POACH / FRIED EGG', 'FOOD', 'Egg Delicacies', 1, 100.00, 100.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-215', '2026-09-24', '215', 'EGG TADKA', 'FOOD', 'Egg Delicacies', 1, 180.00, 180.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-39', '2026-09-24', '39', 'FINGER CHIPS', 'FOOD', 'Soups & Starters', 1, 150.00, 150.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-167', '2026-09-24', '167', 'FISH FRY / ROST', 'FOOD', 'Mutton & Seafood', 2, 200.00, 400.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-232', '2026-09-24', '232', 'FRY PAPAD', 'FOOD', 'Rice & Accompaniments', 2, 30.00, 60.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-563', '2026-09-24', '563', 'GAIL BREAKFAST', 'FOOD', 'GAIL Corporate Meals', 19, 250.00, 4750.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-568', '2026-09-24', '568', 'GAIL N V DINNER', 'FOOD', 'GAIL Corporate Meals', 16, 480.00, 7680.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-565', '2026-09-24', '565', 'GAIL N V LUNCH', 'FOOD', 'GAIL Corporate Meals', 10, 480.00, 4800.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-566', '2026-09-24', '566', 'GAIL SNACKS', 'FOOD', 'GAIL Corporate Meals', 21, 170.00, 3570.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-567', '2026-09-24', '567', 'GAIL VEG DINNER', 'FOOD', 'GAIL Corporate Meals', 9, 370.00, 3330.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-564', '2026-09-24', '564', 'GAIL VEG LUNCH', 'FOOD', 'GAIL Corporate Meals', 5, 370.00, 1850.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-192', '2026-09-24', '192', 'GARDEN FRESH SALAD', 'FOOD', 'Rice & Accompaniments', 6, 80.00, 480.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-287', '2026-09-24', '287', 'GARLIC CHICKEN', 'FOOD', 'Chicken Specialities', 1, 250.00, 250.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-349', '2026-09-24', '349', 'GARLIC NAAN', 'FOOD', 'Tandoori & Breads', 6, 80.00, 480.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-246', '2026-09-24', '246', 'GREEN PEAS FRY', 'FOOD', 'Paneer & Veg Delicacies', 2, 180.00, 360.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-30', '2026-09-24', '30', 'GREEN PEAS MASALA', 'FOOD', 'Paneer & Veg Delicacies', 1, 200.00, 200.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-181', '2026-09-24', '181', 'KADAI PANEER', 'FOOD', 'Paneer & Veg Delicacies', 1, 240.00, 240.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-157', '2026-09-24', '157', 'MASALA OMELETTE', 'FOOD', 'Egg Delicacies', 5, 120.00, 600.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-36', '2026-09-24', '36', 'MASALA PAPAD', 'FOOD', 'Rice & Accompaniments', 17, 40.00, 680.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-175', '2026-09-24', '175', 'MIX VEG CURRY', 'FOOD', 'Paneer & Veg Delicacies', 3, 220.00, 756.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-305', '2026-09-24', '305', 'MIXED FRIED RICE', 'FOOD', 'Rice & Biryani', 2, 300.00, 600.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-266', '2026-09-24', '266', 'MUSHROOM DO PYAZA', 'FOOD', 'Paneer & Veg Delicacies', 1, 240.00, 240.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-95', '2026-09-24', '95', 'MUTTON CURRY', 'FOOD', 'Mutton & Seafood', 3, 370.00, 1110.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-219', '2026-09-24', '219', 'PANEER BHARTHA', 'FOOD', 'Paneer & Veg Delicacies', 1, 240.00, 240.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-179', '2026-09-24', '179', 'PANEER BUTTER MASALA', 'FOOD', 'Paneer & Veg Delicacies', 3, 240.00, 720.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-222', '2026-09-24', '222', 'PANEER KAJU CURRY', 'FOOD', 'Paneer & Veg Delicacies', 4, 240.00, 960.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-183', '2026-09-24', '183', 'PANEER SHAHI KORMA', 'FOOD', 'Paneer & Veg Delicacies', 1, 270.00, 270.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-348', '2026-09-24', '348', 'PHULKA', 'FOOD', 'Tandoori & Breads', 28, 30.00, 840.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-211', '2026-09-24', '211', 'PLAIN DAL', 'FOOD', 'Dal & Curries', 1, 100.00, 100.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-61', '2026-09-24', '61', 'ROASTED PAPAD', 'FOOD', 'Rice & Accompaniments', 12, 25.00, 300.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-247', '2026-09-24', '247', 'SALT & PAPPER MUSHROOM', 'FOOD', 'Soups & Starters', 3, 230.00, 690.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-54', '2026-09-24', '54', 'SALT & PEPPER CORN', 'FOOD', 'Soups & Starters', 5, 220.00, 1100.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-88', '2026-09-24', '88', 'SALT & PEPPER PRAWN', 'FOOD', 'Mutton & Seafood', 3, 350.00, 1050.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-120', '2026-09-24', '120', 'SPL CHICKEN FRIED RICE', 'FOOD', 'Rice & Biryani', 2, 300.00, 600.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-307', '2026-09-24', '307', 'STEAM RICE', 'FOOD', 'Rice & Biryani', 11, 80.00, 880.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-346', '2026-09-24', '346', 'TANDOORI ROTI', 'FOOD', 'Tandoori & Breads', 13, 40.00, 520.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-343', '2026-09-24', '343', 'TANGDI KABAB ( 3Pcs )', 'FOOD', 'Chicken Specialities', 4, 450.00, 1800.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-142', '2026-09-24', '142', 'TANGIDI MASALA', 'FOOD', 'Chicken Specialities', 1, 500.00, 500.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-341', '2026-09-24', '341', 'TD. CHICKEN ( Full )', 'FOOD', 'Chicken Specialities', 1, 500.00, 500.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-109', '2026-09-24', '109', 'TD. CHICKEN ( Half )', 'FOOD', 'Chicken Specialities', 4, 300.00, 1200.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-312', '2026-09-24', '312', 'VEG FRIED RICE', 'FOOD', 'Rice & Biryani', 9, 180.00, 1620.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-188', '2026-09-24', '188', 'VEG JALFREZI', 'FOOD', 'Paneer & Veg Delicacies', 1, 200.00, 200.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-217', '2026-09-24', '217', 'VEG KHAJANA', 'FOOD', 'Paneer & Veg Delicacies', 1, 250.00, 250.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-18', '2026-09-24', '18', 'VEG MANCHOW SOUP', 'FOOD', 'Soups & Starters', 3, 120.00, 360.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-27', '2026-09-24', '27', 'VEG MANCHURIAN', 'FOOD', 'Soups & Starters', 3, 220.00, 660.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-42', '2026-09-24', '42', 'VEG NOODLES', 'FOOD', 'Rice & Biryani', 3, 200.00, 600.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-336', '2026-09-24', '336', 'VEG PULAO', 'FOOD', 'Rice & Biryani', 1, 150.00, 150.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-364', '2026-09-24', '364', 'BLACK TEA', 'BEVERAGE', 'Beverages', 2, 25.00, 50.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-372', '2026-09-24', '372', 'COLD DRINKS 200ml', 'BEVERAGE', 'Beverages', 6, 25.00, 150.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-367', '2026-09-24', '367', 'FRESH LIME SODA', 'BEVERAGE', 'Beverages', 12, 40.00, 480.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-654', '2026-09-24', '654', 'GAIL COFFEE', 'BEVERAGE', 'GAIL Corporate Meals', 19, 15.00, 285.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-653', '2026-09-24', '653', 'GAIL TEA', 'BEVERAGE', 'GAIL Corporate Meals', 59, 15.00, 885.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-375', '2026-09-24', '375', 'MASALA COLD DRINK', 'BEVERAGE', 'Beverages', 5, 40.00, 200.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-212', '2026-09-24', '212', 'MILK HOT OR COLD', 'BEVERAGE', 'Beverages', 1, 60.00, 60.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-373', '2026-09-24', '373', 'PACKED DRINK WATER', 'BEVERAGE', 'Beverages', 38, 20.00, 760.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-374', '2026-09-24', '374', 'SODA 750ml', 'BEVERAGE', 'Beverages', 2, 40.00, 80.00);
INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-1', '2026-09-24', '1', 'TEA', 'BEVERAGE', 'Beverages', 6, 30.00, 180.00);

-- AUTHENTIC NIGHT AUDITS (23-SEP-2026 & 24-SEP-2026)
INSERT OR IGNORE INTO night_audits (
  audit_id, audit_date, total_rooms, occupied_rooms, occupancy_rate,
  room_revenue, pos_fnb_revenue, other_revenue, total_revenue,
  cash_collected, upi_collected, card_collected, corporate_billed,
  discrepancy_amount, auditor_name, notes
) VALUES
('NA-2026-09-23', '2026-09-23', 39, 20, 51.3, 49689.00, 27679.00, 0.00, 77368.00, 24898.00, 0.00, 0.00, 52470.00, 0.00, 'Sudhakar Reddy (Front Office Lead)', 'Verified 23-Sep-2026: Room Revenue ₹49,689.00, F&B Sales ₹27,679.00. Total Sales ₹77,368.00, Cash Collected ₹24,898.00.'),
('NA-2026-09-24', '2026-09-24', 39, 18, 46.2, 42150.00, 29049.00, 0.00, 71199.00, 4866.00, 20790.00, 0.00, 45543.00, 0.00, 'Sudhakar Reddy (Front Office Lead)', 'Verified 24-Sep-2026: Room Revenue ₹42,150.00, F&B Sales ₹29,049.00. Total Sales ₹71,199.00. Cash ₹4,866.00, Bank/UPI ₹20,790.00, Total Collections ₹25,656.00.');

INSERT OR IGNORE INTO night_audit_log (
  audit_id, business_date, total_rooms, occupied_rooms, occupancy_pct,
  adr, revpar, room_revenue, fnb_revenue, other_revenue,
  gross_revenue, cash_collected, upi_collected, card_collected,
  company_billed, cash_opening_float, cash_expected, cash_physical_drawer,
  cash_variance, is_locked, auditor_name, notes
) VALUES
('NAL-2026-09-23', '2026-09-23', 39, 20, 51.3, 2484.45, 1274.08, 49689.00, 27679.00, 0.00, 77368.00, 24898.00, 0.00, 0.00, 52470.00, 5000.00, 29898.00, 29898.00, 0.00, 1, 'Sudhakar Reddy (Front Office Lead)', 'Verified 23-Sep-2026 Night Audit Hard-Lock.'),
('NAL-2026-09-24', '2026-09-24', 39, 18, 46.2, 2341.67, 1080.77, 42150.00, 29049.00, 0.00, 71199.00, 4866.00, 20790.00, 0.00, 45543.00, 5000.00, 9866.00, 9866.00, 0.00, 1, 'Sudhakar Reddy (Front Office Lead)', 'Verified 24-Sep-2026 Night Audit Hard-Lock.');

-- ============================================================================
-- IDEAS SAS G3 RMS ENGINE TABLES (TABLES 46 - 49)
-- ============================================================================

-- 46. RMS RATE GUARDRAILS & PEGS
CREATE TABLE IF NOT EXISTS rms_rate_guardrails (
  tier_id TEXT PRIMARY KEY,
  tier_name TEXT NOT NULL,
  floor_tariff REAL NOT NULL,
  ceiling_tariff REAL NOT NULL,
  comp_peg_percent REAL NOT NULL DEFAULT 8.0,
  automation_mode TEXT NOT NULL DEFAULT 'exception',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pre-seed Guardrails
INSERT OR IGNORE INTO rms_rate_guardrails (tier_id, tier_name, floor_tariff, ceiling_tariff, comp_peg_percent, automation_mode) VALUES
('standard-deluxe', 'Standard Deluxe', 1499.00, 3200.00, 8.0, 'exception'),
('deluxe-room', 'Deluxe Room', 1899.00, 3900.00, 8.0, 'exception'),
('executive-room', 'Executive Room', 2499.00, 5200.00, 8.0, 'exception'),
('premium-suite', 'Premium Suite', 3499.00, 7999.00, 8.0, 'exception');

-- 47. RMS HURDLE RATES & STAY PATTERN RESTRICTIONS (SHADOW BID PRICES)
CREATE TABLE IF NOT EXISTS rms_hurdle_rates (
  id TEXT PRIMARY KEY,
  target_date TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  hurdle_rate REAL NOT NULL,
  min_los INTEGER NOT NULL DEFAULT 1,
  max_los INTEGER NOT NULL DEFAULT 30,
  cta INTEGER NOT NULL DEFAULT 0, -- Closed to Arrival
  ctd INTEGER NOT NULL DEFAULT 0, -- Closed to Departure
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 48. RMS CORPORATE GROUP DISPLACEMENT RFPS
CREATE TABLE IF NOT EXISTS rms_displacement_rfps (
  rfp_id TEXT PRIMARY KEY,
  corporate_name TEXT NOT NULL,
  rooms_requested INTEGER NOT NULL,
  stay_nights INTEGER NOT NULL,
  offered_rate REAL NOT NULL,
  calculated_mar REAL NOT NULL,
  net_gain_loss REAL NOT NULL,
  verdict TEXT NOT NULL,
  ancillary_spend REAL NOT NULL DEFAULT 0,
  evaluated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 49. RMS AUDIT LOG (UNALTERABLE REVENUE OVERRIDE REGISTER)
CREATE TABLE IF NOT EXISTS rms_audit_log (
  log_id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL, -- RATE_PUBLISH, GUARDRAIL_OVERRIDE, MODE_CHANGE, RFP_EVALUATED
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT 'Revenue Director',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 50. CENTRAL GUEST CRM & LOYALTY (REPEAT VISITORS & VIP PROFILES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS guest_profiles (
  guest_id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  id_proof_type TEXT NOT NULL DEFAULT 'Aadhaar',
  id_proof_masked TEXT NOT NULL,
  city TEXT,
  state_of_origin TEXT NOT NULL DEFAULT 'Odisha',
  is_vip INTEGER NOT NULL DEFAULT 0,
  dietary_preference TEXT DEFAULT 'Regular', -- 'Satvik / Jain', 'Vegetarian', 'Regular'
  preferred_room_tier TEXT,
  vehicle_number TEXT,
  total_visits INTEGER NOT NULL DEFAULT 1,
  lifetime_spend REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 51. RESTAURANT KOT VOIDS (ANTI-THEFT CANNON KITCHEN CANCEL LOG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_kot_voids (
  void_id TEXT PRIMARY KEY,
  kot_id TEXT NOT NULL,
  room_or_table TEXT NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  item_amount REAL NOT NULL,
  reason TEXT NOT NULL, -- 'Guest Changed Mind', 'Captain Mistake', 'Food Burnt', 'Item Unavailable'
  custom_note TEXT,
  voided_by TEXT NOT NULL DEFAULT 'Captain',
  authorized_by TEXT NOT NULL DEFAULT 'F&B Manager',
  voided_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 52. INBOUND CORPORATE INQUIRIES (B2B PORTAL LEADS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS corporate_inquiries (
  inquiry_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  gstin TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_monthly_rooms TEXT DEFAULT '5-10 rooms/month',
  status TEXT NOT NULL DEFAULT 'Pending Review', -- 'Pending Review', 'Contacted', 'Agreement Sent', 'Onboarded'
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 53. RESTAURANT TABLES MASTER (CANNON KITCHEN LIVE FLOOR LAYOUT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  table_number TEXT PRIMARY KEY,
  section TEXT NOT NULL DEFAULT 'AC Dining', -- 'AC Dining', 'Family Section', 'Express Counter', 'Executive Lounge'
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'Vacant', -- 'Vacant', 'Occupied', 'Billed', 'Reserved'
  current_kot_id TEXT,
  captain_name TEXT,
  last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 54. DIGITAL KEYCARDS (ENCRYPTED NFC / WEB ACCESS PASSES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS digital_keycards (
  card_id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  access_pin TEXT NOT NULL,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- ============================================================================
-- 55. MAINTENANCE WORK ORDERS (FRONT DESK & ENGINEERING TICKETS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_work_orders (
  ticket_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  issue TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('AC & HVAC', 'Plumbing & Geyser', 'Electrical & TV', 'Carpentry', 'Painting', 'General Maintenance')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')) DEFAULT 'Normal',
  technician TEXT NOT NULL,
  target_eta TEXT NOT NULL DEFAULT 'Within 2 Hours',
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Cancelled')) DEFAULT 'Open',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- Pre-seed 12 Restaurant Tables
INSERT OR IGNORE INTO restaurant_tables (table_number, section, capacity, status) VALUES
('1', 'AC Dining', 4, 'Vacant'),
('2', 'AC Dining', 4, 'Vacant'),
('3', 'AC Dining', 2, 'Vacant'),
('4', 'AC Dining', 6, 'Vacant'),
('5', 'AC Dining', 4, 'Vacant'),
('6', 'Family Section', 8, 'Vacant'),
('7', 'Family Section', 6, 'Vacant'),
('8', 'Family Section', 4, 'Vacant'),
('9', 'Express Counter', 2, 'Vacant'),
('10', 'Express Counter', 2, 'Vacant'),
('11', 'Executive Lounge', 4, 'Vacant'),
('12', 'Executive Lounge', 6, 'Vacant');

-- ============================================================================
-- 56. ITEM-WISE SALES REPORTS (MYSOFT / CANNON KITCHEN DAILY PRODUCT MIX)
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_item_sales (
  record_id TEXT PRIMARY KEY,
  report_date TEXT NOT NULL, -- e.g. 2026-09-24
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  section TEXT NOT NULL, -- FOOD, BEVERAGE, OTHERS
  category TEXT NOT NULL,
  total_qty INTEGER NOT NULL,
  unit_rate REAL NOT NULL,
  sales_amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- HIGH-PERFORMANCE PRODUCTION DATABASE INDEXES
-- ============================================================================

-- 1. Mutex & Booking Date Collision Index (High Frequency Reservation Check)
CREATE INDEX IF NOT EXISTS idx_bookings_conflict 
  ON bookings (room_number, check_in_date, check_out_date, booking_status);

-- 2. GSTR-1, Police Register & Chronological Lookup Index
CREATE INDEX IF NOT EXISTS idx_bookings_created 
  ON bookings (created_at DESC);

-- 3. Repeat Guest Lookup by Phone
CREATE INDEX IF NOT EXISTS idx_bookings_phone 
  ON bookings (guest_phone);

-- 4. Double-Entry Master Folio Transactions Index (Instant Folio Modal Load)
CREATE INDEX IF NOT EXISTS idx_folio_txns_folio 
  ON folio_transactions (folio_id);

-- 5. Night Audit Hard-Lock Batch & Room Audit Index
CREATE INDEX IF NOT EXISTS idx_folio_txns_room_lock 
  ON folio_transactions (room_number, is_locked);

-- 6. Multi-Tender Split Payment by Folio
CREATE INDEX IF NOT EXISTS idx_split_payments_folio 
  ON split_payments (folio_id);

-- 7. Corporate Statement of Account & TDS Index
CREATE INDEX IF NOT EXISTS idx_corporate_ledger_corp 
  ON corporate_ledger (corporate_id, entry_date DESC);

-- 8. 10-Minute Cart Abandonment & Hold Expiry Cleanup Index
CREATE INDEX IF NOT EXISTS idx_room_holds_expiry 
  ON room_holds (expires_at, client_ip);

-- 9. DPDP Act 2023 30-Day Auto-Purge Cron Index
CREATE INDEX IF NOT EXISTS idx_consent_records_purge 
  ON consent_records (purge_scheduled_at);

-- 10. Live Kitchen Order Display Index
CREATE INDEX IF NOT EXISTS idx_food_orders_room 
  ON food_orders (room_number, status);

-- 11. Staff Biometric Attendance Index
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date 
  ON attendance (staff_id, date);

-- ============================================================================
-- 58. TALLY PRIME MASTER LEDGERS (CHART OF ACCOUNTS)
-- ============================================================================
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

-- 59. TALLY PRIME DOUBLE-ENTRY BALANCED VOUCHERS
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

-- 60. TALLY PRIME VOUCHER LINE ITEMS
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

-- 61. OFFICIAL GST PORTAL GSTR-1 RETURNS (GSTN SCHEMA v1.7)
CREATE TABLE IF NOT EXISTS gstr1_filings (
  filing_id TEXT PRIMARY KEY,
  return_period TEXT NOT NULL,
  gstin TEXT NOT NULL DEFAULT '21AEKPP8689J1ZS',
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

-- 62. GSTR-2B INPUT TAX CREDIT (ITC) INWARD SUPPLIES & RECONCILIATION
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

-- 63. GST FRONT OFFICE MODULE (FOM) INVOICE REGISTER & AMENDMENTS
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

-- 64. GUEST STATION / PLANT TRANSFERS & CAB DISPATCH LOG
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

-- 65. RESTAURANT TABLE BILL SETTLEMENTS & CASHIER PAYMENTS
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

-- 66. CORPORATE ADVANCE TARIFF QUOTATIONS & PROFORMA PROPOSALS
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

-- 67. RULE 48 STATUTORY MULTI-COPY INVOICE PRINT AUDIT LOG
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

-- 68. UNIVERSAL INLINE CELL EDIT PERSISTENT OVERRIDES
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

-- Additional Indexes for high throughput querying
CREATE INDEX IF NOT EXISTS idx_tally_vouchers_date ON tally_vouchers (voucher_date DESC);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_lines_vno ON tally_voucher_lines (voucher_no);
CREATE INDEX IF NOT EXISTS idx_gstr2b_period ON gstr2b_inward_supplies (return_period, reconciliation_status);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON guest_transfers (dispatch_status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_table_settle_date ON restaurant_table_settlements (settled_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_corp ON corporate_quotations (corporate_id, status);
CREATE INDEX IF NOT EXISTS idx_print_logs_inv ON invoice_print_audit_logs (invoice_no, printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_inline_override_tbl ON universal_inline_overrides (table_name, row_key, column_key);



