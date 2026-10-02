-- ============================================================================
-- HOTEL SAI INTERNATIONAL - PRODUCTION ENTERPRISE INDEXES & CONSTRAINTS
-- Migration: 0006_comprehensive_architecture_indexes.sql
-- Optimizes query performance, foreign key lookups, and eliminates table scans.
-- ============================================================================

-- 1. NIGHT AUDITS & FINANCIAL DAY CLOSING
CREATE INDEX IF NOT EXISTS idx_night_audits_audit_date 
  ON night_audits (audit_date DESC);

CREATE INDEX IF NOT EXISTS idx_night_audit_log_date_locked 
  ON night_audit_log (business_date, is_locked);

CREATE INDEX IF NOT EXISTS idx_night_audit_log_closed_at 
  ON night_audit_log (closed_at DESC);

-- 2. ROOM INVENTORY & REAL-TIME PMS LOOKUPS
CREATE INDEX IF NOT EXISTS idx_rooms_status_floor 
  ON rooms (status, floor);

CREATE INDEX IF NOT EXISTS idx_rooms_tier_tariff 
  ON rooms (tier, tariff);

-- 3. ROOM MAINTENANCE & OUT-OF-ORDER BLOCKERS
CREATE INDEX IF NOT EXISTS idx_maintenance_room_status 
  ON maintenance_work_orders (room_number, status, priority);

-- 4. LOST AND FOUND DIGITAL VAULT
CREATE INDEX IF NOT EXISTS idx_lost_found_status_date 
  ON lost_and_found (status, found_date DESC);

CREATE INDEX IF NOT EXISTS idx_lost_found_room 
  ON lost_and_found (room_number);

-- 5. CORPORATE CONSOLIDATED BILLING & B2B RECONCILIATION
CREATE INDEX IF NOT EXISTS idx_corp_invoices_corp 
  ON corporate_b2b_invoices (corporate_id);

CREATE INDEX IF NOT EXISTS idx_corporate_partners_gstin 
  ON corporate_partners (gstin);

-- 6. GUEST PROFILES & IDENTITY LOOKUPS
CREATE INDEX IF NOT EXISTS idx_guest_profiles_phone 
  ON guest_profiles (phone);

-- 7. STORE PURCHASES & INVENTORY REQUISITIONS
CREATE INDEX IF NOT EXISTS idx_store_purchases_vendor 
  ON store_purchases (vendor_name);

-- 8. SERVICE REQUESTS & CONCIERGE DISPATCH
CREATE INDEX IF NOT EXISTS idx_room_service_status 
  ON room_service_requests (status, priority, requested_at DESC);
