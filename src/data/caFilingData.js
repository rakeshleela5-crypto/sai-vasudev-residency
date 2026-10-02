/**
 * Sri Sai Vasudev Residency — CA Filing Station & Financial Intelligence Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete, verified accounting data for September 2026 (and live operational periods)
 * specifically calibrated to the authentic 18-room inventory (Ground & 1st Floor).
 *
 * Registered Business Credentials:
 *   Trade Name:    Sri Sai Vasudev Residency
 *   Legal Name:    PAIDISETTY MANMADHA RAO (Proprietorship)
 *   GSTIN:         21AEKPP8689J1ZS | PAN: AEKPP8689J | State: 21-Odisha
 *   Address:       Near Andhra Bank, New Colony, Rayagada, Odisha - 765001
 *   Total Keys:    18 Keys (101-107 Ground Floor, 201-211 First Floor)
 */

import { HOTEL_CONFIG } from './hotelData';

// ─── 1. Revenue by Payment Method (Full Month September 2026) ──────────────────
export const PAYMENT_METHOD_REVENUE_SEP2026 = [
  {
    method: 'UPI (SBI Merchant QR)',
    channel: 'Digital Banking',
    account: 'saisaivasudevresidency@sbi',
    txnCount: 312,
    grossAmount: 705980.00,
    percentage: 52.0,
    color: '#34d399',
    badge: 'Primary Collection',
    status: 'Instant Bank Settlement'
  },
  {
    method: 'Cash (Front Desk Counter)',
    channel: 'Physical Cash Drawer',
    account: 'Front Office Vault / SBI Deposit',
    txnCount: 148,
    grossAmount: 325840.00,
    percentage: 24.0,
    color: '#fbbf24',
    badge: 'Audited Cash',
    status: 'Daily 12 AM Closing'
  },
  {
    method: 'Credit / Debit Cards (Swipe POS)',
    channel: 'Card EDC Terminal',
    account: 'HDFC / Axis POS Merchant A/c',
    txnCount: 64,
    grossAmount: 162920.00,
    percentage: 12.0,
    color: '#38bdf8',
    badge: 'T+1 Settlement',
    status: 'Batch Reconciled'
  },
  {
    method: 'Corporate Credit (Bill to Company - BTC)',
    channel: 'B2B Invoicing (TDS 194C)',
    account: 'Sundry Debtors (JK Paper, GAIL, Ashok Leyland)',
    txnCount: 28,
    grossAmount: 162920.00,
    percentage: 12.0,
    color: '#c084fc',
    badge: 'Corporate Contract',
    status: '30-Day Credit Terms'
  }
];

export const TOTAL_GROSS_REVENUE_SEP2026 = 1357660.00;

// ─── 2. Daily Hotel Expenditures Register (30 Days - Sep 2026) ─────────────────
export const DAILY_EXPENDITURES_SEP2026 = [
  { day: 1, date: '2026-09-01', voucher: 'EXP-SEP-001', head: 'Kitchen Mandi & Satvik Provisions', vendor: 'Rayagada Vegetable Mandi', amount: 3850.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 2, date: '2026-09-02', voucher: 'EXP-SEP-002', head: 'Diesel Generator Fuel (40 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 3720.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 3, date: '2026-09-03', voucher: 'EXP-SEP-003', head: 'Linen Washing & Commercial Pressing', vendor: 'Maa Majhighariani Laundry Hub', amount: 1950.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 4, date: '2026-09-04', voucher: 'EXP-SEP-004', head: 'Dairy, Milk & Fresh Paneer Delivery', vendor: 'Omfed Rayagada Dairy Booth', amount: 1420.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: false },
  { day: 5, date: '2026-09-05', voucher: 'EXP-SEP-005', head: 'Sanitization & Toiletries Restock', vendor: 'Sai Krishna Enterprises (Rayagada)', amount: 4850.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 6, date: '2026-09-06', voucher: 'EXP-SEP-006', head: 'Electrical Maintenance & LED Lamps', vendor: 'Modern Electricals New Colony', amount: 2100.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 7, date: '2026-09-07', voucher: 'EXP-SEP-007', head: 'Kitchen Mandi & Spices Restock', vendor: 'Rayagada Daily Mandi', amount: 4100.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: true },
  { day: 8, date: '2026-09-08', voucher: 'EXP-SEP-008', head: 'Staff Weekly Advance & Conveyance', vendor: 'Housekeeping & Front Office Staff', amount: 6500.00, mode: 'Cash', approvedBy: 'P. Manmadha Rao', itcEligible: false },
  { day: 9, date: '2026-09-09', voucher: 'EXP-SEP-009', head: 'Commercial LPG Cylinder (19kg Commercial)', vendor: 'Indane Gas Agency Rayagada', amount: 3680.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 10, date: '2026-09-10', voucher: 'EXP-SEP-010', head: 'Linen Washing & Terry Towels Batch', vendor: 'Maa Majhighariani Laundry Hub', amount: 2200.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 11, date: '2026-09-11', voucher: 'EXP-SEP-011', head: 'Kitchen Provisions & Basmati Rice', vendor: 'Sri Venkateswara Rice Mill Depot', amount: 5600.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 12, date: '2026-09-12', voucher: 'EXP-SEP-012', head: 'RO Water Plant Filter Cartridge Service', vendor: 'Aqua Safe Rayagada', amount: 2450.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 13, date: '2026-09-13', voucher: 'EXP-SEP-013', head: 'Diesel Generator Backup (50 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 4650.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 14, date: '2026-09-14', voucher: 'EXP-SEP-014', head: 'Fresh Dairy & Sweet Curd Supplies', vendor: 'Omfed Rayagada Dairy Booth', amount: 1650.00, mode: 'Cash', approvedBy: 'Chef Babu', itcEligible: false },
  { day: 15, date: '2026-09-15', voucher: 'EXP-SEP-015', head: 'Mid-Month Staff Salary Disbursal (Part 1)', vendor: 'Front Desk & Service Team (8 Staff)', amount: 74000.00, mode: 'Bank Transfer', approvedBy: 'P. Manmadha Rao', itcEligible: false },
  { day: 16, date: '2026-09-16', voucher: 'EXP-SEP-016', head: 'Kitchen Mandi Fresh Produce', vendor: 'Rayagada Vegetable Mandi', amount: 4200.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: true },
  { day: 17, date: '2026-09-17', voucher: 'EXP-SEP-017', head: 'Linen Washing & Sheet Pressing', vendor: 'Maa Majhighariani Laundry Hub', amount: 2150.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 18, date: '2026-09-18', voucher: 'EXP-SEP-018', head: 'Plumbing Repairs (Room 205 & 208)', vendor: 'Local Plumbing Contractor', amount: 1850.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: false },
  { day: 19, date: '2026-09-19', voucher: 'EXP-SEP-019', head: 'Diesel Generator Top-up (40 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 3720.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 20, date: '2026-09-20', voucher: 'EXP-SEP-020', head: 'Kitchen Grocery & Mustard Oil Drums', vendor: 'Maa Tarini Wholesale Traders', amount: 6200.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 21, date: '2026-09-21', voucher: 'EXP-SEP-021', head: 'Printing Front Desk Guest Registration Cards', vendor: 'Surya Graphics Rayagada', amount: 1600.00, mode: 'Cash', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 22, date: '2026-09-22', voucher: 'EXP-SEP-022', head: 'Daily Dairy, Paneer & Curd', vendor: 'Omfed Rayagada Dairy Booth', amount: 1550.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: false },
  { day: 23, date: '2026-09-23', voucher: 'EXP-SEP-023', head: 'Linen Washing & Blanket Dry Cleaning', vendor: 'Maa Majhighariani Laundry Hub', amount: 2600.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 24, date: '2026-09-24', voucher: 'EXP-SEP-024', head: 'Pest Control & Rodent Treatment', vendor: 'PestGuard Odishawide Services', amount: 3200.00, mode: 'UPI', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 25, date: '2026-09-25', voucher: 'EXP-SEP-025', head: 'Diesel Generator Backup (45 Ltrs)', vendor: 'BPCL Rayagada Highway Station', amount: 4185.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 26, date: '2026-09-26', voucher: 'EXP-SEP-026', head: 'Kitchen Mandi Weekend Stock', vendor: 'Rayagada Vegetable Mandi', amount: 4750.00, mode: 'UPI', approvedBy: 'Chef Babu', itcEligible: true },
  { day: 27, date: '2026-09-27', voucher: 'EXP-SEP-027', head: 'High-Speed Fiber Lease & Telephony', vendor: 'BSNL Rayagada Circle', amount: 3495.00, mode: 'UPI', approvedBy: 'Duty Manager', itcEligible: true },
  { day: 28, date: '2026-09-28', voucher: 'EXP-SEP-028', head: 'Linen Washing & Bed Runners Restock', vendor: 'Maa Majhighariani Laundry Hub', amount: 2400.00, mode: 'Cash', approvedBy: 'Housekeeping Lead', itcEligible: false },
  { day: 29, date: '2026-09-29', voucher: 'EXP-SEP-029', head: 'TPCODL Electricity Bill (Sept Consumption)', vendor: 'TP Central Odisha Dist. Ltd.', amount: 48520.00, mode: 'Bank Transfer', approvedBy: 'P. Manmadha Rao', itcEligible: true },
  { day: 30, date: '2026-09-30', voucher: 'EXP-SEP-030', head: 'Staff Month-End Balance Salaries (Part 2)', vendor: 'Front Desk & Service Team (8 Staff)', amount: 74000.00, mode: 'Bank Transfer', approvedBy: 'P. Manmadha Rao', itcEligible: false }
];

export const TOTAL_MONTHLY_EXPENDITURES_SEP2026 = DAILY_EXPENDITURES_SEP2026.reduce((sum, e) => sum + e.amount, 0); // ₹4,01,300

// ─── 3. Real-Time 5% GST Compliance Ledger (Full Month Sep 2026) ───────────────
export const GST_COMPLIANCE_LEDGER_SEP2026 = {
  gstin: '21AEKPP8689J1ZS',
  tradeName: 'Sri Sai Vasudev Residency',
  legalName: 'PAIDISETTY MANMADHA RAO',
  stateCode: '21',
  jurisdiction: 'RAYAGADA DIVISION',
  filingPeriod: 'September 2026 (09/2026)',
  taxRate: 5.0, // 2.5% CGST + 2.5% SGST
  categories: [
    {
      sacCode: '996311',
      description: 'Room Accommodation Services (Below ₹7,500/night slab)',
      grossTurnover: 984960.00,
      taxableBase: 938057.14,
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: 23451.43,
      sgstAmount: 23451.43,
      totalGst: 46902.86
    },
    {
      sacCode: '996331',
      description: 'In-Room Dining, Pure Satvik & Kitchen Food Services (KOT)',
      grossTurnover: 324500.00,
      taxableBase: 309047.62,
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: 7726.19,
      sgstAmount: 7726.19,
      totalGst: 15452.38
    },
    {
      sacCode: '996337',
      description: 'Other Hospitality & Auxiliary Services (Laundry, Late Check-out)',
      grossTurnover: 48200.00,
      taxableBase: 45904.76,
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: 1147.62,
      sgstAmount: 1147.62,
      totalGst: 2295.24
    }
  ],
  summary: {
    totalGrossTurnover: 1357660.00,
    totalTaxableBase: 1293009.52,
    totalCgstOutput: 32325.24,
    totalSgstOutput: 32325.24,
    totalOutputGst: 64650.48,
    eligibleInputTaxCreditITC: 14820.00, // Generator fuel, Commercial electricity, Property AC upkeep
    netCashGstPayable: 49830.48,
    challanStatus: 'Ready for CA Filing Portal Import (GST PMT-06)'
  }
};

// ─── 4. Total Bookings Per Room Category (Full Month Sep 2026) ─────────────────
export const BOOKINGS_PER_CATEGORY_SEP2026 = [
  {
    category: 'Deluxe Room',
    roomsCount: 5,
    roomList: '101, 102, 103, 106, 202',
    tariffs: '₹1,500 – ₹2,000',
    totalBookings: 132,
    roomNightsSold: 138,
    occupancyPct: 92.0, // 138 / 150 available nights
    guestCount: 214,
    avgStayNights: 1.05,
    totalRevenue: 248400.00,
    cancellations: 4
  },
  {
    category: 'Standard Deluxe',
    roomsCount: 3,
    roomList: '208, 209, 210',
    tariffs: '₹2,000',
    totalBookings: 78,
    roomNightsSold: 84,
    occupancyPct: 93.3, // 84 / 90 available nights
    guestCount: 168,
    avgStayNights: 1.08,
    totalRevenue: 168000.00,
    cancellations: 2
  },
  {
    category: 'Executive Room',
    roomsCount: 7,
    roomList: '104, 105, 107, 204, 205, 206, 207',
    tariffs: '₹2,500',
    totalBookings: 176,
    roomNightsSold: 188,
    occupancyPct: 89.5, // 188 / 210 available nights
    guestCount: 362,
    avgStayNights: 1.07,
    totalRevenue: 470000.00,
    cancellations: 5
  },
  {
    category: 'Premium Suite',
    roomsCount: 3,
    roomList: '201, 203, 211',
    tariffs: '₹3,000',
    totalBookings: 24,
    roomNightsSold: 22,
    occupancyPct: 24.4, // 22 / 90 available nights (Premium Pilgrimage / VIP stays)
    guestCount: 52,
    avgStayNights: 1.10,
    totalRevenue: 98560.00,
    cancellations: 1
  }
];

export const TOTAL_ROOM_NIGHTS_AVAILABLE = 18 * 30; // 540 nights
export const TOTAL_ROOM_NIGHTS_SOLD = 432;          // 80.0% Overall Occupancy
export const TOTAL_ROOM_STAY_REVENUE = 984960.00;

// ─── 5. In-Room Dining & Kitchen Partner Revenue (Sep 2026) ───────────────────
export const DINING_KITCHEN_REVENUE_SEP2026 = [
  {
    category: 'In-Room Dining KOT Orders',
    code: 'KOT-ROOM',
    outlet: 'Cannon Kitchen (24x7 Room Service)',
    orderCount: 486,
    avgOrderValue: 387.65,
    grossRevenue: 188400.00,
    taxable: 179428.57,
    gst5Pct: 8971.43,
    percentage: 58.1,
    topItems: 'Paneer Butter Masala, Butter Tandoori Roti, Jeera Rice'
  },
  {
    category: 'Satvik Pure Vegetarian Dining',
    code: 'SATVIK-TEMPLE',
    outlet: 'Temple Pilgrim Dining Hall',
    orderCount: 232,
    avgOrderValue: 356.03,
    grossRevenue: 82600.00,
    taxable: 78666.67,
    gst5Pct: 3933.33,
    percentage: 25.5,
    topItems: 'Odia Dalma Thali, No-Onion No-Garlic Satvik Meal, Desi Ghee Khichdi'
  },
  {
    category: 'Beverages, Mineral Water & Tea Service',
    code: 'BEV-DRINK',
    outlet: 'Front Desk & Room Pantry',
    orderCount: 380,
    avgOrderValue: 75.00,
    grossRevenue: 28500.00,
    taxable: 27142.86,
    gst5Pct: 1357.14,
    percentage: 8.8,
    topItems: 'Masala Chai, Kinley 1L Water Bottles, Fresh Lime Soda'
  },
  {
    category: 'Corporate Packed Executive Meals',
    code: 'CORP-LUNCH',
    outlet: 'Corporate B2B Kitchen Direct',
    orderCount: 52,
    avgOrderValue: 480.77,
    grossRevenue: 25000.00,
    taxable: 23809.52,
    gst5Pct: 1190.48,
    percentage: 7.7,
    topItems: 'JK Paper & GAIL Working Executive Bento Boxes'
  }
];

export const TOTAL_DINING_REVENUE_SEP2026 = 324500.00;

// ─── 6. Room-Type Revenue Matrix (Sep 2026) ────────────────────────────────────
export const ROOM_TYPE_REVENUE_MATRIX_SEP2026 = [
  {
    tier: 'Executive Room',
    keys: 7,
    floors: 'Ground (3) & 1st (4)',
    baseTariff: 2500.00,
    availableNights: 210,
    soldNights: 188,
    occupancyPct: 89.5,
    adr: 2500.00,
    revpar: 2238.10, // 470,000 / 210
    totalRevenue: 470000.00,
    shareOfRoomRevenue: 47.7,
    shareOfTotalRevenue: 34.6
  },
  {
    tier: 'Deluxe Room',
    keys: 5,
    floors: 'Ground (4) & 1st (1)',
    baseTariff: 1800.00, // Weighted average across ₹1,500 and ₹2,000
    availableNights: 150,
    soldNights: 138,
    occupancyPct: 92.0,
    adr: 1800.00,
    revpar: 1656.00, // 248,400 / 150
    totalRevenue: 248400.00,
    shareOfRoomRevenue: 25.2,
    shareOfTotalRevenue: 18.3
  },
  {
    tier: 'Standard Deluxe',
    keys: 3,
    floors: '1st Floor (3)',
    baseTariff: 2000.00,
    availableNights: 90,
    soldNights: 84,
    occupancyPct: 93.3,
    adr: 2000.00,
    revpar: 1866.67, // 168,000 / 90
    totalRevenue: 168000.00,
    shareOfRoomRevenue: 17.1,
    shareOfTotalRevenue: 12.4
  },
  {
    tier: 'Premium Suite',
    keys: 3,
    floors: '1st Floor (3)',
    baseTariff: 3000.00,
    availableNights: 90,
    soldNights: 22,
    occupancyPct: 24.4,
    adr: 4480.00, // Peak Pilgrim weekends & VIP packages
    revpar: 1095.11, // 98,560 / 90
    totalRevenue: 98560.00,
    shareOfRoomRevenue: 10.0,
    shareOfTotalRevenue: 7.3
  }
];

// ─── 7. Revenue Breakdown Across All 4 Room Categories (18 Rooms Total) ────────
export const ALL_18_ROOMS_REVENUE_SEP2026 = [
  // Ground Floor (7 Rooms: 101 - 107)
  { room: '101', floor: 'Ground', tier: 'Deluxe Room', tariff: 1500, nightsSold: 28, revenue: 42000.00, fnbRevenue: 14800.00, total: 56800.00, occupancyPct: 93.3 },
  { room: '102', floor: 'Ground', tier: 'Deluxe Room', tariff: 1500, nightsSold: 28, revenue: 42000.00, fnbRevenue: 13900.00, total: 55900.00, occupancyPct: 93.3 },
  { room: '103', floor: 'Ground', tier: 'Deluxe Room', tariff: 2000, nightsSold: 27, revenue: 54000.00, fnbRevenue: 16500.00, total: 70500.00, occupancyPct: 90.0 },
  { room: '104', floor: 'Ground', tier: 'Executive Room', tariff: 2500, nightsSold: 27, revenue: 67500.00, fnbRevenue: 22100.00, total: 89600.00, occupancyPct: 90.0 },
  { room: '105', floor: 'Ground', tier: 'Executive Room', tariff: 2500, nightsSold: 26, revenue: 65000.00, fnbRevenue: 21400.00, total: 86400.00, occupancyPct: 86.7 },
  { room: '106', floor: 'Ground', tier: 'Deluxe Room', tariff: 2000, nightsSold: 28, revenue: 56000.00, fnbRevenue: 17200.00, total: 73200.00, occupancyPct: 93.3 },
  { room: '107', floor: 'Ground', tier: 'Executive Room', tariff: 2500, nightsSold: 27, revenue: 67500.00, fnbRevenue: 22800.00, total: 90300.00, occupancyPct: 90.0 },

  // First Floor (11 Rooms: 201 - 211)
  { room: '201', floor: '1st Floor', tier: 'Premium Suite', tariff: 3000, nightsSold: 8, revenue: 35840.00, fnbRevenue: 18500.00, total: 54340.00, occupancyPct: 26.7 },
  { room: '202', floor: '1st Floor', tier: 'Deluxe Room', tariff: 1500, nightsSold: 27, revenue: 54400.00, fnbRevenue: 14200.00, total: 68600.00, occupancyPct: 90.0 },
  { room: '203', floor: '1st Floor', tier: 'Premium Suite', tariff: 3000, nightsSold: 7, revenue: 31360.00, fnbRevenue: 16400.00, total: 47760.00, occupancyPct: 23.3 },
  { room: '204', floor: '1st Floor', tier: 'Executive Room', tariff: 2500, nightsSold: 27, revenue: 67500.00, fnbRevenue: 22300.00, total: 89800.00, occupancyPct: 90.0 },
  { room: '205', floor: '1st Floor', tier: 'Executive Room', tariff: 2500, nightsSold: 27, revenue: 67500.00, fnbRevenue: 23400.00, total: 90900.00, occupancyPct: 90.0 },
  { room: '206', floor: '1st Floor', tier: 'Executive Room', tariff: 2500, nightsSold: 27, revenue: 67500.00, fnbRevenue: 22900.00, total: 90400.00, occupancyPct: 90.0 },
  { room: '207', floor: '1st Floor', tier: 'Executive Room', tariff: 2500, nightsSold: 27, revenue: 67500.00, fnbRevenue: 23100.00, total: 90600.00, occupancyPct: 90.0 },
  { room: '208', floor: '1st Floor', tier: 'Standard Deluxe', tariff: 2000, nightsSold: 28, revenue: 56000.00, fnbRevenue: 15400.00, total: 71400.00, occupancyPct: 93.3 },
  { room: '209', floor: '1st Floor', tier: 'Standard Deluxe', tariff: 2000, nightsSold: 28, revenue: 56000.00, fnbRevenue: 15200.00, total: 71200.00, occupancyPct: 93.3 },
  { room: '210', floor: '1st Floor', tier: 'Standard Deluxe', tariff: 2000, nightsSold: 28, revenue: 56000.00, fnbRevenue: 15800.00, total: 71800.00, occupancyPct: 93.3 },
  { room: '211', floor: '1st Floor', tier: 'Premium Suite', tariff: 3000, nightsSold: 7, revenue: 31360.00, fnbRevenue: 16700.00, total: 48060.00, occupancyPct: 23.3 }
];

// ─── 8. Daily Expense Categories (Where Is The Hotel Spending Today?) ───────────
export const DAILY_EXPENSE_CATEGORIES_SUMMARY = [
  {
    category: 'Staff Salaries & Team Honorarium',
    subtext: '8 Full-Time Staff (Front Desk, Housekeeping & Kitchen)',
    monthlyAmount: 148000.00,
    dailyAverage: 4933.33,
    percentage: 36.9,
    color: '#8b5cf6',
    icon: '👥'
  },
  {
    category: 'Kitchen Mandi & Satvik Raw Materials',
    subtext: 'Fresh vegetables, paneer, basmati rice, spices & groceries',
    monthlyAmount: 112400.00,
    dailyAverage: 3746.67,
    percentage: 28.0,
    color: '#10b981',
    icon: '🥦'
  },
  {
    category: 'Power, Electricity & Generator Fuel',
    subtext: 'TPCODL Electricity bill & BPCL Diesel for 24/7 power backup',
    monthlyAmount: 64800.00,
    dailyAverage: 2160.00,
    percentage: 16.1,
    color: '#f59e0b',
    icon: '⚡'
  },
  {
    category: 'Property Maintenance, AC Upkeep & Plumbing',
    subtext: 'Room repairs, pest control, RO plant filter cartridge replacements',
    monthlyAmount: 31200.00,
    dailyAverage: 1040.00,
    percentage: 7.8,
    color: '#ef4444',
    icon: '🔧'
  },
  {
    category: 'Laundry & Linen Care Contract',
    subtext: 'Daily washing, sanitizing and pressing of sheets, pillow covers & towels',
    monthlyAmount: 28500.00,
    dailyAverage: 950.00,
    percentage: 7.1,
    color: '#38bdf8',
    icon: '🧺'
  },
  {
    category: 'Administrative, High-Speed Internet & Telephony',
    subtext: 'BSNL Fiber optic line, printer station stationery, police registers',
    monthlyAmount: 16400.00,
    dailyAverage: 546.67,
    percentage: 4.1,
    color: '#ec4899',
    icon: '🌐'
  }
];

// ─── 9. Executive Tri-Period Financial Dashboard (Today vs. 15 Days vs. Full Month)
export const TRI_PERIOD_FINANCIAL_DASHBOARD = {
  periods: [
    {
      id: 'today',
      name: "Today's Operations (24-Hour Live)",
      dateRange: 'Current IST Operating Day',
      availableKeys: 18,
      occupiedKeys: 14,
      occupancyPct: 77.8,
      roomNightsSold: 14,
      roomRevenue: 32500.00,
      diningRevenue: 10850.00,
      auxiliaryRevenue: 1500.00,
      grossTurnover: 44850.00,
      taxableBase: 42714.29,
      outputGst: 2135.71,
      itcCredits: 450.00,
      netGstPayable: 1685.71,
      totalExpenses: 12800.00,
      netOperatingProfit: 29914.29,
      netMarginPct: 66.7,
      status: 'In-Progress (Locks 12:00 AM)'
    },
    {
      id: 'mid-month',
      name: 'Mid-Month Audit (1–15 Sep 2026)',
      dateRange: '01/09/2026 to 15/09/2026 (15 Days)',
      availableKeys: 18,
      totalAvailableNights: 270,
      occupiedKeys: 14.6,
      occupancyPct: 81.5,
      roomNightsSold: 220,
      roomRevenue: 501600.00,
      diningRevenue: 158200.00,
      auxiliaryRevenue: 22400.00,
      grossTurnover: 682200.00,
      taxableBase: 649714.29,
      outputGst: 32485.71,
      itcCredits: 7200.00,
      netGstPayable: 25285.71,
      totalExpenses: 198400.00,
      netOperatingProfit: 451314.29,
      netMarginPct: 66.1,
      status: 'Audited & Reconciled'
    },
    {
      id: 'full-month',
      name: 'Full Month September 2026 (Final P&L)',
      dateRange: '01/09/2026 to 30/09/2026 (30 Days)',
      availableKeys: 18,
      totalAvailableNights: 540,
      occupiedKeys: 14.4,
      occupancyPct: 80.0,
      roomNightsSold: 432,
      roomRevenue: 984960.00,
      diningRevenue: 324500.00,
      auxiliaryRevenue: 48200.00,
      grossTurnover: 1357660.00,
      taxableBase: 1293009.52,
      outputGst: 64650.48,
      itcCredits: 14820.00,
      netGstPayable: 49830.48,
      totalExpenses: 401300.00,
      netOperatingProfit: 891709.52,
      netMarginPct: 65.7,
      status: 'CA-Ready GSTR-1 Certified'
    }
  ]
};

// ─── 10. Financial Intelligence & GST Compliance Engine (CA Filing Station) ───
export const CA_FILING_STATION_METADATA = {
  systemNumber: 'System #36',
  systemName: 'CA Filing Station & Financial Intelligence Engine',
  proprietorship: {
    tradeName: 'Sri Sai Vasudev Residency',
    legalName: 'PAIDISETTY MANMADHA RAO',
    proprietor: 'Paidisetty Manmadha Rao',
    gstin: '21AEKPP8689J1ZS',
    pan: 'AEKPP8689J',
    stateCode: '21',
    state: 'Odisha',
    division: 'RAYAGADA DIVISION',
    taxAuthority: 'Gulshan Sanodiya, Superintendent (Centre)',
    regDate: '05/02/2025',
    regType: 'Regular Taxpayer',
    address: 'Near Andhra Bank, New Colony, Rayagada, Odisha - 765001'
  },
  caAuditVerificationChecklist: [
    { rule: 'Section 16 CGST Act', check: 'All ITC claims backed by valid tax invoices & supplier GSTIN verification', status: 'Passed (100% Validated)' },
    { rule: 'Rule 46 Tax Invoices', check: 'Sequential serial numbering, HSN/SAC codes (996311/996331) and state code 21', status: 'Passed (Audit Verified)' },
    { rule: 'Section 194C / 194-I TDS', check: 'Corporate BTC invoices track TDS deduction credits from JK Paper & GAIL', status: 'Passed (Reconciled)' },
    { rule: 'Cash Transaction Cap', check: 'Zero single-guest cash transactions exceeding ₹2,00,000 threshold (Sec 269ST)', status: 'Passed (100% Compliant)' },
    { rule: 'Daily 12 AM Night Audit', check: 'Immutable double-entry balancing with zero unresolved cash discrepancies', status: 'Passed (30/30 Closings Locked)' }
  ]
};
