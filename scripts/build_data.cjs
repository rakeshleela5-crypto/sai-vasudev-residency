const fs = require('fs');
const path = require('path');
const items = require('./generated_items.json');

// 1. Generate migrations/0005_seed_authentic_menu_and_audits.sql
let sql = `-- ============================================================================
-- HOTEL SAI INTERNATIONAL - MIGRATION 0005
-- AUTHENTIC CANNON KITCHEN MENU (85 ITEMS) & DAILY SALES AUDIT (23 & 24 SEP 2026)
-- ============================================================================

-- Ensure menu_items has item_code
-- 56. ITEM-WISE SALES REPORTS (MYSOFT / CANNON KITCHEN DAILY PRODUCT MIX)
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

-- SEED 85 AUTHENTIC MENU ITEMS
`;

items.forEach(it => {
  const desc = it.desc.replace(/'/g, "''");
  const name = it.name.replace(/'/g, "''");
  const cat = it.cat.replace(/'/g, "''");
  sql += `INSERT OR REPLACE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-${it.code}', '${it.code}', '${name}', '${cat}', ${it.rate.toFixed(2)}, ${it.veg}, ${it.jain}, ${it.spec}, '${desc}', 1);\n`;
});

sql += '\n-- SEED 85 AUTHENTIC ITEM-WISE SALES ENTRIES FOR 2026-09-24\n';
items.forEach(it => {
  const name = it.name.replace(/'/g, "''");
  const cat = it.cat.replace(/'/g, "''");
  sql += `INSERT OR REPLACE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-${it.code}', '2026-09-24', '${it.code}', '${name}', '${it.sec}', '${cat}', ${it.qty}, ${it.rate.toFixed(2)}, ${it.sales.toFixed(2)});\n`;
});

sql += `\n-- SEED AUTHENTIC NIGHT AUDITS (23-SEP-2026 & 24-SEP-2026)
INSERT OR REPLACE INTO night_audits (
  audit_id, audit_date, total_rooms, occupied_rooms, occupancy_rate,
  room_revenue, pos_fnb_revenue, other_revenue, total_revenue,
  cash_collected, upi_collected, card_collected, corporate_billed,
  discrepancy_amount, auditor_name, notes
) VALUES
('NA-2026-09-23', '2026-09-23', 39, 20, 51.3, 49689.00, 27679.00, 0.00, 77368.00, 24898.00, 0.00, 0.00, 52470.00, 0.00, 'Sudhakar Reddy (Front Office Lead)', 'Verified 23-Sep-2026: Room Revenue ₹49,689.00, F&B Sales ₹27,679.00. Total Sales ₹77,368.00, Cash Collected ₹24,898.00.'),
('NA-2026-09-24', '2026-09-24', 39, 18, 46.2, 42150.00, 29049.00, 0.00, 71199.00, 4866.00, 20790.00, 0.00, 45543.00, 0.00, 'Sudhakar Reddy (Front Office Lead)', 'Verified 24-Sep-2026: Room Revenue ₹42,150.00, F&B Sales ₹29,049.00. Total Sales ₹71,199.00. Cash ₹4,866.00, Bank/UPI ₹20,790.00, Total Collections ₹25,656.00.');

-- SEED AUTHENTIC NIGHT AUDIT LOGS (23-SEP-2026 & 24-SEP-2026)
INSERT OR REPLACE INTO night_audit_log (
  audit_id, business_date, total_rooms, occupied_rooms, occupancy_pct,
  adr, revpar, room_revenue, fnb_revenue, other_revenue,
  gross_revenue, cash_collected, upi_collected, card_collected,
  company_billed, cash_opening_float, cash_expected, cash_physical_drawer,
  cash_variance, is_locked, auditor_name, notes
) VALUES
('NAL-2026-09-23', '2026-09-23', 39, 20, 51.3, 2484.45, 1274.08, 49689.00, 27679.00, 0.00, 77368.00, 24898.00, 0.00, 0.00, 52470.00, 5000.00, 29898.00, 29898.00, 0.00, 1, 'Sudhakar Reddy (Front Office Lead)', 'Verified 23-Sep-2026 Night Audit Hard-Lock.'),
('NAL-2026-09-24', '2026-09-24', 39, 18, 46.2, 2341.67, 1080.77, 42150.00, 29049.00, 0.00, 71199.00, 4866.00, 20790.00, 0.00, 45543.00, 5000.00, 9866.00, 9866.00, 0.00, 1, 'Sudhakar Reddy (Front Office Lead)', 'Verified 24-Sep-2026 Night Audit Hard-Lock.');
`;

fs.writeFileSync(path.join(__dirname, '../migrations/0005_seed_authentic_menu_and_audits.sql'), sql);
console.log('Wrote migrations/0005_seed_authentic_menu_and_audits.sql');
