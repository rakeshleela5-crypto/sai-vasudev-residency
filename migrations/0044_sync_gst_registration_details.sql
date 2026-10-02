-- ============================================================================
-- HOTEL SAI VASUDEV RESIDENCY - RAYAGADA (OFFICIAL GST REGISTRATION SYNC)
-- Form GST REG-06 [Rule 10(1)] Certificate Integration
-- Trade Name: SRI SAI VASUDEV RESIDENCY
-- Legal Name: PAIDISETTY MANMADHA RAO
-- GSTIN: 21AEKPP8689J1ZS | PAN: AEKPP8689J | State Code: 21 (Odisha)
-- Address: Near Andhra Bank, New Colony, Rayagada, Odisha - 765001
-- ============================================================================

-- 1. Insert or Replace Hotel Configuration Master Records
INSERT OR REPLACE INTO hotel_config (key, value, description) VALUES
('hotel_name', 'Sri Sai Vasudev Residency', 'Official Trade Name'),
('trade_name', 'Sri Sai Vasudev Residency', 'Form GST REG-06 Trade Name'),
('legal_name', 'PAIDISETTY MANMADHA RAO', 'Form GST REG-06 Legal Name'),
('proprietor', 'Paidisetty Manmadha Rao', 'Registered Proprietor Name'),
('constitution', 'Proprietorship', 'Constitution of Business'),
('hotel_address', 'Near Andhra Bank, New Colony, Rayagada, Odisha - 765001', 'Principal Place of Business'),
('landmark', 'Near Andhra Bank', 'Address Landmark'),
('street', 'New Colony', 'Road/Street'),
('city', 'Rayagada', 'City/Town/Village'),
('district', 'Rayagada', 'District'),
('state', 'Odisha', 'State Name'),
('pin_code', '765001', 'PIN Code'),
('gstin', '21AEKPP8689J1ZS', 'Official Form GST REG-06 Identification Number'),
('pan', 'AEKPP8689J', 'Permanent Account Number'),
('state_code', '21', 'GST State Code for Odisha'),
('registration_type', 'Regular', 'GST Taxpayer Registration Type'),
('registration_date', '05/02/2025', 'GST Registration Approval Date'),
('jurisdictional_office', 'RAYAGADA DIVISION', 'Jurisdictional Tax Office'),
('approving_authority', 'Gulshan Sanodiya, Superintendent (Centre)', 'Approving Authority'),
('phone', '+91 8895225555', 'Primary Switchboard Phone'),
('alt_phone', '+91 8249258377', 'Secondary Reception Phone'),
('email', 'saisaivasudevresidency@gmail.com', 'Official Reservations Email'),
('upi_id', 'saisaivasudevresidency@sbi', 'Official Merchant UPI ID');

-- 2. Update existing GSTR-1 records with the official GSTIN
UPDATE gstr1_filings 
SET gstin = '21AEKPP8689J1ZS'
WHERE gstin != '21AEKPP8689J1ZS';
