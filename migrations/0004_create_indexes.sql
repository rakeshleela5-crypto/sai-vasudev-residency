-- ============================================================================
-- HOTEL SAI INTERNATIONAL - PERFORMANCE PRODUCTION INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_conflict 
  ON bookings (room_number, check_in_date, check_out_date, booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_created 
  ON bookings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_phone 
  ON bookings (guest_phone);

CREATE INDEX IF NOT EXISTS idx_folio_txns_folio 
  ON folio_transactions (folio_id);

CREATE INDEX IF NOT EXISTS idx_folio_txns_room_lock 
  ON folio_transactions (room_number, is_locked);

CREATE INDEX IF NOT EXISTS idx_split_payments_folio 
  ON split_payments (folio_id);

CREATE INDEX IF NOT EXISTS idx_corporate_ledger_corp 
  ON corporate_ledger (corporate_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_room_holds_expiry 
  ON room_holds (expires_at, client_ip);

CREATE INDEX IF NOT EXISTS idx_consent_records_purge 
  ON consent_records (purge_scheduled_at);

CREATE INDEX IF NOT EXISTS idx_food_orders_room 
  ON food_orders (room_number, status);

CREATE INDEX IF NOT EXISTS idx_attendance_staff_date 
  ON attendance (staff_id, date);
