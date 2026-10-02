-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA, ODISHA (PIN: 765001)
-- MIGRATION: ADD OPTIONAL EXTENSION COLUMNS TO EXISTING TABLES
-- ============================================================================

ALTER TABLE rooms ADD COLUMN outstanding_balance REAL NOT NULL DEFAULT 0;
ALTER TABLE rooms ADD COLUMN room_type TEXT NOT NULL DEFAULT 'EXEDEL';
ALTER TABLE rooms ADD COLUMN pax TEXT NOT NULL DEFAULT '1 Pax';

ALTER TABLE bookings ADD COLUMN company_name TEXT;
ALTER TABLE bookings ADD COLUMN bill_no TEXT;

ALTER TABLE food_orders ADD COLUMN outlet TEXT NOT NULL DEFAULT 'Cannon Kitchen';
ALTER TABLE food_orders ADD COLUMN discount REAL NOT NULL DEFAULT 0;
ALTER TABLE food_orders ADD COLUMN discount_reason TEXT;
ALTER TABLE food_orders ADD COLUMN is_non_commercial INTEGER NOT NULL DEFAULT 0;
ALTER TABLE food_orders ADD COLUMN nc_reason TEXT;
ALTER TABLE food_orders ADD COLUMN captain_name TEXT;

ALTER TABLE corporate_partners ADD COLUMN opening_balance REAL NOT NULL DEFAULT 0;
ALTER TABLE corporate_partners ADD COLUMN credit_limit REAL NOT NULL DEFAULT 50000;
ALTER TABLE corporate_partners ADD COLUMN preferred_tier TEXT NOT NULL DEFAULT 'Executive Room';
