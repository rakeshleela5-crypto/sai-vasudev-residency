-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA, ODISHA (PIN: 765001)
-- MIGRATION: TABLES 50 TO 55 & OPERATIONAL EXTENSIONS
-- ============================================================================

-- 50. CENTRAL GUEST CRM & LOYALTY (REPEAT VISITORS & VIP PROFILES)
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
  dietary_preference TEXT DEFAULT 'Regular',
  preferred_room_tier TEXT,
  vehicle_number TEXT,
  total_visits INTEGER NOT NULL DEFAULT 1,
  lifetime_spend REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 51. RESTAURANT KOT VOIDS (ANTI-THEFT CANNON KITCHEN CANCEL LOG)
CREATE TABLE IF NOT EXISTS restaurant_kot_voids (
  void_id TEXT PRIMARY KEY,
  kot_id TEXT NOT NULL,
  room_or_table TEXT NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  item_amount REAL NOT NULL,
  reason TEXT NOT NULL,
  custom_note TEXT,
  voided_by TEXT NOT NULL DEFAULT 'Captain',
  authorized_by TEXT NOT NULL DEFAULT 'F&B Manager',
  voided_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 52. INBOUND CORPORATE INQUIRIES (B2B PORTAL LEADS)
CREATE TABLE IF NOT EXISTS corporate_inquiries (
  inquiry_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  gstin TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_monthly_rooms TEXT DEFAULT '5-10 rooms/month',
  status TEXT NOT NULL DEFAULT 'Pending Review',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 53. RESTAURANT TABLES MASTER (CANNON KITCHEN LIVE FLOOR LAYOUT)
CREATE TABLE IF NOT EXISTS restaurant_tables (
  table_number TEXT PRIMARY KEY,
  section TEXT NOT NULL DEFAULT 'AC Dining',
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'Vacant',
  current_kot_id TEXT,
  captain_name TEXT,
  last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 54. DIGITAL KEYCARDS (ENCRYPTED NFC / WEB ACCESS PASSES)
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

-- 55. MAINTENANCE WORK ORDERS (FRONT DESK & ENGINEERING TICKETS)
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
