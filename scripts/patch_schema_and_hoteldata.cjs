const fs = require('fs');
const path = require('path');
const items = require('./generated_items.json');

// --- 1. PATCH schema.sql ---
const schemaPath = path.join(__dirname, '../schema.sql');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// A. Update menu_items table definition to include item_code
const oldMenuDef = `-- 22. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  item_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Breakfast, Odia Delicacies, Starters, Main Course, Satvik & Jain, Beverages
  price REAL NOT NULL,
  is_veg INTEGER NOT NULL DEFAULT 1,
  is_jain INTEGER NOT NULL DEFAULT 0,
  is_special INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_available INTEGER NOT NULL DEFAULT 1
);`;

const newMenuDef = `-- 22. MENU ITEMS
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
);`;

if (schemaContent.includes(oldMenuDef)) {
  schemaContent = schemaContent.replace(oldMenuDef, newMenuDef);
  console.log('✓ Updated menu_items table definition in schema.sql');
}

// B. Add Table 56: daily_item_sales before index section
const table56Def = `-- ============================================================================
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

`;

if (!schemaContent.includes('daily_item_sales')) {
  schemaContent = schemaContent.replace(
    '-- ============================================================================\n-- HIGH-PERFORMANCE PRODUCTION DATABASE INDEXES',
    table56Def + '-- ============================================================================\n-- HIGH-PERFORMANCE PRODUCTION DATABASE INDEXES'
  );
  console.log('✓ Added Table 56 daily_item_sales in schema.sql');
}

// C. Replace 7 dummy menu items with 85 authentic items + 85 daily item sales + night audits
let newSeedMenuSql = `-- MENU ITEMS (AUTHENTIC CANNON KITCHEN & MYSOFT POS 85 ITEMS)
`;
items.forEach(it => {
  const desc = it.desc.replace(/'/g, "''");
  const name = it.name.replace(/'/g, "''");
  const cat = it.cat.replace(/'/g, "''");
  newSeedMenuSql += `INSERT OR IGNORE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) VALUES ('MENU-${it.code}', '${it.code}', '${name}', '${cat}', ${it.rate.toFixed(2)}, ${it.veg}, ${it.jain}, ${it.spec}, '${desc}', 1);\n`;
});

newSeedMenuSql += `\n-- DAILY ITEM-WISE SALES (AUTHENTIC AUDITED REPORT 2026-09-24: TOTAL ₹67,846.00)\n`;
items.forEach(it => {
  const name = it.name.replace(/'/g, "''");
  const cat = it.cat.replace(/'/g, "''");
  newSeedMenuSql += `INSERT OR IGNORE INTO daily_item_sales (record_id, report_date, item_code, item_name, section, category, total_qty, unit_rate, sales_amount) VALUES ('DIS-20260924-${it.code}', '2026-09-24', '${it.code}', '${name}', '${it.sec}', '${cat}', ${it.qty}, ${it.rate.toFixed(2)}, ${it.sales.toFixed(2)});\n`;
});

newSeedMenuSql += `\n-- AUTHENTIC NIGHT AUDITS (23-SEP-2026 & 24-SEP-2026)
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
`;

const oldDummyMenu = `-- MENU ITEMS (ODIA DELICACIES & SATVIK JAIN SPECIALS)
INSERT OR IGNORE INTO menu_items (item_id, name, category, price, is_veg, is_jain, is_special, description) VALUES
('MENU-01', 'Chhena Poda Supreme', 'Odia Delicacies', 180.00, 1, 1, 1, 'Traditional Odisha caramelized baked cottage cheese dessert made with Rayagada dairy.'),
('MENU-02', 'Pakhala Thali Deluxe', 'Odia Delicacies', 220.00, 1, 0, 1, 'Fermented rice served with Badi Chura, saga bhaja, aloo chakata, and roasted papad.'),
('MENU-03', 'Dalma with Jeera Rice', 'Odia Delicacies', 240.00, 1, 1, 1, 'Lentils cooked with raw papaya, pumpkin, eggplant and tempered with ghee cumin panch phoron.'),
('MENU-04', 'Satvik Shahi Paneer (No Onion/Garlic)', 'Satvik & Jain', 290.00, 1, 1, 0, 'Creamy cashewnut and tomato reduction with pure desi ghee.'),
('MENU-05', 'Executive Breakfast Buffet (Complimentary in Room)', 'Breakfast', 350.00, 1, 0, 1, 'Idli, Vada, Puri Sabzi, Upma, Masala Chai, Fresh Fruits and Odia Sweets.'),
('MENU-06', 'Mushroom Besara', 'Main Course', 260.00, 1, 0, 0, 'Fresh buttons simmered in traditional Rayagada mustard and dry mango gravy.'),
('MENU-07', 'Filter Coffee / Spiced Masala Chai', 'Beverages', 60.00, 1, 1, 0, 'Freshly brewed decoction with cardamom and ginger.');`;

if (schemaContent.includes(oldDummyMenu)) {
  schemaContent = schemaContent.replace(oldDummyMenu, newSeedMenuSql.trim());
  console.log('✓ Replaced dummy menu with 85 authentic items in schema.sql');
}

fs.writeFileSync(schemaPath, schemaContent);
console.log('✓ schema.sql updated successfully.');

// --- 2. PATCH src/data/hotelData.js ---
const hotelDataPath = path.join(__dirname, '../src/data/hotelData.js');
let hotelDataContent = fs.readFileSync(hotelDataPath, 'utf8');

// Generate RESTAURANT_MENU JS code
const menuJsItems = items.map((it, idx) => {
  const dineIn = it.rate;
  const roomServ = Math.round(dineIn * 1.1 / 5) * 5;
  const swiggy = Math.round(dineIn * 1.25 / 5) * 5;
  const bar = Math.round(dineIn * 1.05 / 5) * 5;
  return `  {
    id: "m-${it.code}",
    itemCode: "${it.code}",
    name: "${it.name}",
    category: "${it.cat}",
    section: "${it.sec}",
    price: ${dineIn},
    dineInPrice: ${dineIn},
    roomServicePrice: ${roomServ},
    swiggyPrice: ${swiggy},
    barPrice: ${bar},
    isVeg: ${it.veg === 1},
    isJain: ${it.jain === 1},
    isSpecial: ${it.spec === 1},
    description: "${it.desc}"
  }`;
}).join(',\n');

const newRestaurantMenu = `// Multi-Outlet F&B Menu with Fast Item Codes (Cannon Kitchen, Drop In Bar, Room Service, Swiggy)
// 85 Authentic Items with Item Codes from Hotel Sai International Live Operations
export const RESTAURANT_MENU = [
${menuJsItems}
];

// Authentic Item Wise Sales Report (2026-09-24 ~ 2026-09-24)
// Total Food: ₹64,716.00 (353 Qty) | Total Beverage: ₹3,130.00 (150 Qty) | Grand Total: ₹67,846.00 (503 Qty)
export const ITEM_WISE_SALES_REPORT_2026_09_24 = [
${items.map(it => `  { itemCode: "${it.code}", itemName: "${it.name}", section: "${it.sec}", category: "${it.cat}", totalQty: ${it.qty}, rate: ${it.rate}, salesAmount: ${it.sales}, isVeg: ${it.veg === 1} }`).join(',\n')}
];`;

// Find RESTAURANT_MENU block in hotelData.js and replace it
const menuStart = hotelDataContent.indexOf('export const RESTAURANT_MENU = [');
const menuEnd = hotelDataContent.indexOf('export const SPIRITUAL_SIGHTS = [');

if (menuStart !== -1 && menuEnd !== -1) {
  hotelDataContent = hotelDataContent.substring(0, menuStart) + newRestaurantMenu + '\n\n' + hotelDataContent.substring(menuEnd);
  console.log('✓ Replaced RESTAURANT_MENU in hotelData.js and added ITEM_WISE_SALES_REPORT_2026_09_24');
}

// Add 23-Sep and 24-Sep audits to INITIAL_NIGHT_AUDITS
const nightAuditHook = 'export const INITIAL_NIGHT_AUDITS = [';
const newNightAudits = `export const INITIAL_NIGHT_AUDITS = [
  {
    auditId: "NA-2026-09-24",
    businessDate: "2026-09-24",
    closedAt: "2026-09-25 00:02:10",
    totalRooms: 39,
    occupiedRooms: 18,
    occupancyPct: 46.2,
    adr: 2341.67,
    revpar: 1080.77,
    roomRevenue: 42150.00,
    fnbRevenue: 29049.00,
    otherRevenue: 0.00,
    grossRevenue: 71199.00,
    cashCollected: 4866.00,
    upiCollected: 20790.00,
    cardCollected: 0.00,
    companyBilled: 45543.00,
    cashOpeningFloat: 5000.00,
    cashExpected: 9866.00,
    cashPhysicalDrawer: 9866.00,
    cashVariance: 0.00,
    isLocked: 1,
    auditorName: "Sudhakar Reddy (Front Office Lead)",
    notes: "Verified 24-Sep-2026: Room Revenue ₹42,150.00, F&B Sales ₹29,049.00. Total Sales ₹71,199.00. Cash ₹4,866.00, Bank/UPI ₹20,790.00, Total Collections ₹25,656.00."
  },
  {
    auditId: "NA-2026-09-23",
    businessDate: "2026-09-23",
    closedAt: "2026-09-24 00:03:40",
    totalRooms: 39,
    occupiedRooms: 20,
    occupancyPct: 51.3,
    adr: 2484.45,
    revpar: 1274.08,
    roomRevenue: 49689.00,
    fnbRevenue: 27679.00,
    otherRevenue: 0.00,
    grossRevenue: 77368.00,
    cashCollected: 24898.00,
    upiCollected: 0.00,
    cardCollected: 0.00,
    companyBilled: 52470.00,
    cashOpeningFloat: 5000.00,
    cashExpected: 29898.00,
    cashPhysicalDrawer: 29898.00,
    cashVariance: 0.00,
    isLocked: 1,
    auditorName: "Sudhakar Reddy (Front Office Lead)",
    notes: "Verified 23-Sep-2026: Room Revenue ₹49,689.00, F&B Sales ₹27,679.00. Total Sales ₹77,368.00, Cash Collected ₹24,898.00."
  },`;

if (hotelDataContent.includes(nightAuditHook)) {
  hotelDataContent = hotelDataContent.replace(nightAuditHook, newNightAudits);
  console.log('✓ Added 24-Sep and 23-Sep audits to INITIAL_NIGHT_AUDITS in hotelData.js');
}

fs.writeFileSync(hotelDataPath, hotelDataContent);
console.log('✓ hotelData.js updated successfully.');
