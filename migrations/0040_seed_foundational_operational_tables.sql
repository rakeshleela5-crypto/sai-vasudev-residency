-- ============================================================================
-- HOTEL SAI INTERNATIONAL - FOUNDATIONAL OPERATIONAL TABLES SEED
-- Populates Staff, Expense Categories, Expenses, Police Register,
-- Maintenance, Room Service Catalog, Coupons, and Guest Profiles
-- ============================================================================

-- 1. STAFF ROSTER (8 Operational Roles)
INSERT OR REPLACE INTO staff (id, name, role, phone, shift, monthly_salary, status, joined_date) VALUES
('STF-001', 'Bikash Mohanty', 'Manager', '+91 94370 22101', 'Morning', 35000, 'Active', '2024-01-15'),
('STF-002', 'Prasanta Senapati', 'Receptionist', '+91 94370 22102', 'Morning', 22000, 'Active', '2024-03-01'),
('STF-003', 'Sunil Kumar Behera', 'Receptionist', '+91 94370 22103', 'Evening', 22000, 'Active', '2024-04-10'),
('STF-004', 'Dinesh Sahu', 'Night Auditor', '+91 94370 22104', 'Night', 24000, 'Active', '2024-02-20'),
('STF-005', 'Chef Tarun Das', 'Chef', '+91 94370 22105', 'Morning', 32000, 'Active', '2024-01-20'),
('STF-006', 'Ramesh Naik', 'Housekeeping', '+91 94370 22106', 'Morning', 16000, 'Active', '2024-05-01'),
('STF-007', 'Gopal Gouda', 'Maintenance', '+91 94370 22107', 'Morning', 19000, 'Active', '2024-03-15'),
('STF-008', 'Kalu Charan Biswal', 'Security', '+91 94370 22108', 'Night', 15000, 'Active', '2024-02-01');

-- 2. STAFF ATTENDANCE TODAY
INSERT OR REPLACE INTO attendance (record_id, staff_id, date, shift, status, check_in_time, check_out_time) VALUES
('ATT-001-260928', 'STF-001', '2026-09-28', 'Morning', 'Present', '08:45 AM', NULL),
('ATT-002-260928', 'STF-002', '2026-09-28', 'Morning', 'Present', '06:50 AM', NULL),
('ATT-003-260928', 'STF-005', '2026-09-28', 'Morning', 'Present', '06:30 AM', NULL),
('ATT-004-260928', 'STF-006', '2026-09-28', 'Morning', 'Present', '07:00 AM', NULL),
('ATT-005-260928', 'STF-007', '2026-09-28', 'Morning', 'Present', '08:00 AM', NULL);

-- 3. EXPENSE CATEGORIES (8 Statutory Expense Heads)
INSERT OR REPLACE INTO expense_categories (id, category_name, monthly_budget) VALUES
('EXP-CAT-01', 'Vegetables & Groceries', 180000),
('EXP-CAT-02', 'Diesel Generator & Fuel', 45000),
('EXP-CAT-03', 'Electricity & Utilities (TPCODL)', 95000),
('EXP-CAT-04', 'Linen & Laundry Chemicals', 25000),
('EXP-CAT-05', 'Maintenance & Spares', 35000),
('EXP-CAT-06', 'Staff Welfare & Meals', 20000),
('EXP-CAT-07', 'Printing & Stationery', 12000),
('EXP-CAT-08', 'Guest Transit Fuel & Tolls', 18000);

-- 4. PETTY CASH & DAILY EXPENSES
INSERT OR REPLACE INTO expenses (expense_id, category, amount, vendor_name, paid_by, payment_mode, date, notes) VALUES
('EXP-2609-01', 'Vegetables & Groceries', 3450.00, 'Rayagada Daily Sabzi Mandi', 'Bikash Mohanty', 'Cash', '2026-09-28', 'Fresh vegetables, coriander, tomatoes, paneer for Cannon kitchen'),
('EXP-2609-02', 'Diesel Generator & Fuel', 4200.00, 'HPCL Fuel Station, Convent Junction', 'Gopal Gouda', 'UPI', '2026-09-27', '50 Litres HSD for 125kVA Cummins Silent Genset backup'),
('EXP-2609-03', 'Linen & Laundry Chemicals', 1850.00, 'Diversey Hygiene Supplies', 'Ramesh Naik', 'Cash', '2026-09-26', 'Clax Sonril oxygen bleach & Taski R2 hygienic floor cleaner'),
('EXP-2609-04', 'Printing & Stationery', 950.00, 'Maa Majhigouri Print Press', 'Prasanta Senapati', 'Cash', '2026-09-25', 'Registration GRC books, GST bill rolls & keycard envelopes');

-- 5. ROOM SERVICE CATALOG
INSERT OR REPLACE INTO room_service_catalog (service_code, title, category, chargeable, turnaround_minutes) VALUES
('RS-01', 'Extra Orthopedic Cotton Pillow', 'Amenities', 0.00, 10),
('RS-02', 'Packaged Drinking Water (2 x 1L)', 'Amenities', 0.00, 5),
('RS-03', 'Complete Dental & Shaving Kit', 'Amenities', 0.00, 10),
('RS-04', 'Express Steam Ironing (Per Garment)', 'Laundry', 50.00, 30),
('RS-05', 'Rayagada Junction (RGDA) Station Drop', 'Station Transit', 200.00, 15),
('RS-06', 'Maa Majhigouri Temple Darshan Cab', 'Station Transit', 350.00, 20),
('RS-07', 'Sanitized High-Thread Linen Replacement', 'Housekeeping', 0.00, 15),
('RS-08', 'Hot Ginger Masala Tea Flask', 'F&B', 60.00, 12);

-- 6. ACTIVE DISCOUNT COUPONS
INSERT OR REPLACE INTO coupons (code, discount_type, discount_value, min_booking_amount, max_discount, valid_until, usage_count, is_active) VALUES
('SAI10', 'Percentage', 10.0, 1500.0, 500.0, '2026-12-31', 14, 1),
('RAYAGADA20', 'Percentage', 20.0, 3000.0, 1000.0, '2026-10-31', 8, 1),
('CORP5', 'Percentage', 5.0, 2000.0, 300.0, '2026-12-31', 25, 1),
('DEVOTEE15', 'Percentage', 15.0, 2199.0, 600.0, '2026-11-30', 11, 1);

-- 7. FESTIVE PRICING SURCHARGE CALENDAR
INSERT OR REPLACE INTO festive_pricing_rules (rule_id, festival_name, start_date, end_date, multiplier, is_active) VALUES
('FEST-01', 'Chaiti Mahotsav (Rayagada Cultural Festival)', '2026-12-24', '2026-12-30', 1.25, 1),
('FEST-02', 'Maa Majhigouri Annual Chaitra Jatra', '2026-03-20', '2026-03-28', 1.30, 1),
('FEST-03', 'Jagannath Ratha Yatra & Bahuda', '2026-07-05', '2026-07-16', 1.20, 1),
('FEST-04', 'New Year Grand Gala (Cannon Restaurant)', '2026-12-31', '2027-01-02', 1.35, 1);

-- 8. SARAI ACT POLICE REGISTER ENTRIES
INSERT OR REPLACE INTO police_guest_entries (entry_id, booking_id, guest_name, phone, id_type, id_number_masked, state_origin, arrival_time, departure_time, purpose_of_visit, dispatch_status) VALUES
('POL-2609-01', 'WALK-092801', 'karthikeya', '94848585855', 'Aadhaar', 'XXXX-XXXX-5855', 'Odisha', '2026-09-28 11:30', '2026-09-29 12:00', 'Industrial Engineering Audit', 'Dispatched'),
('POL-2609-02', 'FMBIL2627-01533', 'LAVAKANTA', '+91 94370 12046', 'Aadhaar', 'XXXX-XXXX-9102', 'Odisha', '2026-09-24 18:20', '2026-09-29 12:00', 'Business Consultation', 'Dispatched'),
('POL-2609-03', 'FMBIL2627-01534', 'SATYARANJAN', '+91 94370 12119', 'Aadhaar', 'XXXX-XXXX-8422', 'Odisha', '2026-09-24 21:00', '2026-09-29 12:00', 'Corporate B2B - Vedanta', 'Dispatched'),
('POL-2609-04', 'FMBIL2627-01536', 'S S HAMEED', '+91 94370 12192', 'Driving License', 'OD-18-XXXX-4410', 'Andhra Pradesh', '2026-09-24 19:40', '2026-09-29 12:00', 'Paper Mill Equipment Inspection', 'Dispatched');

-- 9. MAINTENANCE DEFECT WORK ORDERS
INSERT OR REPLACE INTO maintenance_work_orders (ticket_id, room_number, issue, category, priority, technician, target_eta, status, notes) VALUES
('WO-2609-01', '309', 'AC cooling refrigerant pressure low & display error E4', 'AC & HVAC', 'High', 'Gopal Gouda', 'Within 2 Hours', 'Open', 'Daikin inverter gas top-up and filter wash in progress'),
('WO-2609-02', '204', 'Bathroom mixer faucet aerator scale cleaning', 'Plumbing & Geyser', 'Normal', 'Gopal Gouda', 'Within 4 Hours', 'Resolved', 'Descaled with Taski R9, water pressure restored'),
('WO-2609-03', '402', 'Smart TV Wi-Fi re-connection & HDMI set-top box reboot', 'Electrical & TV', 'Low', 'Sunil Kumar Behera', 'Within 1 Hour', 'Resolved', 'Airtel DTH smartcard re-paired');

-- 10. CASHIER SHIFT HANDOVER
INSERT OR REPLACE INTO cashier_shift_handovers (
  handover_id, shift_date, shift_type, outgoing_cashier, incoming_cashier,
  opening_float, cash_sales, petty_cash_paid, cash_collected, upi_collected, card_collected,
  corporate_credit, total_revenue, expected_drawer_cash, actual_drawer_cash,
  closing_cash_expected, closing_cash_actual, variance_amount, variance, status, verified_by
) VALUES (
  'SH-20260928-M', '2026-09-28', 'Morning (07:00-15:00)', 'Prasanta Senapati', 'Sunil Kumar Behera',
  5000.00, 8900.00, 3450.00, 10450.00, 14200.00, 6800.00,
  12500.00, 40400.00, 12000.00, 12000.00,
  12000.00, 12000.00, 0.00, 0.00, 'Balanced', 'Duty Manager'
);

-- 11. LOST & FOUND LOCKER
INSERT OR REPLACE INTO lost_and_found (item_id, room_number, item_name, description, found_by, found_date, status) VALUES
('LNF-2609-01', '301', 'Titan Edge Slim Watch (Silver Dial)', 'Found on the bedside nightstand after checkout inspection', 'Ramesh Naik', '2026-09-27', 'In Custody'),
('LNF-2609-02', '412', 'Apple 67W USB-C Fast Charger with Braided Cable', 'Plugged into the desk surge protector socket', 'Ramesh Naik', '2026-09-26', 'In Custody');

-- 12. SECURITY & PERIMETER LOGS
INSERT OR REPLACE INTO security_incidents (incident_id, incident_date, severity, location, description, reported_by, resolution_status) VALUES
('SEC-2609-01', '2026-09-28 03:00', 'Low', 'Main Parking & Genset Yard', 'Routine night perimeter surveillance check. All external gates locked, CCTV camera 1-16 functional.', 'Kalu Charan Biswal', 'Resolved');

-- 13. CENTRAL GUEST PROFILES (CRM)
INSERT OR REPLACE INTO guest_profiles (guest_id, phone, name, email, id_proof_type, id_proof_masked, state_of_origin, total_visits, lifetime_spend) VALUES
('GUEST-01', '94848585855', 'karthikeya', 'karthikeya@gmail.com', 'Aadhaar', 'XXXX-XXXX-5855', 'Odisha', 1, 2899.00),
('GUEST-02', '+91 94370 12046', 'LAVAKANTA', 'lavakanta@gmail.com', 'Aadhaar', 'XXXX-XXXX-9102', 'Odisha', 3, 14850.00),
('GUEST-03', '+91 94370 12119', 'SATYARANJAN', 'satyaranjan@vedanta.co.in', 'Aadhaar', 'XXXX-XXXX-8422', 'Odisha', 5, 42500.00),
('GUEST-04', '+91 94370 12192', 'S S HAMEED', 'hameed.engg@jkpaper.com', 'Driving License', 'OD-18-XXXX-4410', 'Andhra Pradesh', 4, 31200.00);
