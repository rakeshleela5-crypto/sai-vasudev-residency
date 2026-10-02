-- Migration: 0042_payment_and_inquiry_tables.sql
-- Adds support tables for Razorpay payment flow and guest booking inquiries

-- =====================================================
-- TABLE: inquiries
-- Stores guest room booking inquiry submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id    TEXT NOT NULL UNIQUE,      -- e.g. HSI-INQ-M5X2K
  guest_name    TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT DEFAULT '',
  check_in      TEXT NOT NULL,             -- Date string: YYYY-MM-DD
  check_out     TEXT NOT NULL,             -- Date string: YYYY-MM-DD
  room_type     TEXT NOT NULL,             -- e.g. "Executive AC Double Room"
  guests_count  INTEGER DEFAULT 1,
  notes         TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending'     -- pending | contacted | converted | closed
                CHECK (status IN ('pending','contacted','converted','closed')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_phone      ON inquiries (phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);

-- =====================================================
-- TABLE: payment_orders
-- Audit trail for every Razorpay order created and verified
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     TEXT NOT NULL UNIQUE,       -- Razorpay order_id (e.g. order_XXXXX)
  payment_id   TEXT,                       -- Razorpay payment_id after successful payment
  booking_ref  TEXT,                       -- Internal booking reference (e.g. HSI-RES-M5X2K)
  amount_paise INTEGER NOT NULL,           -- Amount in paise (₹1500 = 150000 paise)
  currency     TEXT NOT NULL DEFAULT 'INR',
  receipt      TEXT,
  status       TEXT NOT NULL DEFAULT 'created'
               CHECK (status IN ('created','paid','failed','tampered','refunded')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_status     ON payment_orders (status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_booking    ON payment_orders (booking_ref);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders (created_at DESC);
