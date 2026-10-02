const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:4173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching Headless Chrome for High-Fidelity Tab Walkthrough...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: {
      width: 1600,
      height: 1000,
      deviceScaleFactor: 1.5
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();

  // Helper to take screenshot
  async function snap(filename, label) {
    console.log(`📸 Capturing: ${label} -> ${filename}`);
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`   Saved: ${filePath}`);
  }

  // Pre-seed admin credentials so front desk and operational modules open seamlessly
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('hsi_admin_pin', '7650');
    sessionStorage.setItem('hsi_admin_pin', '7650');
  });

  // Reload to ensure localStorage takes effect
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await sleep(1500);

  // 1. Hero Booking Portal
  await snap('01_hero_booking_portal.png', 'Public Landing - Hero & Booking Bar');

  // 2. Room Inventory Catalog
  await page.evaluate(() => {
    const el = document.getElementById('inventory');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await snap('02_room_inventory_catalog.png', 'Public Landing - 40-Room Catalog & Dynamic Rates');

  // 3. Satvik Dining Section
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const h = headings.find(el => el.innerText.includes('Fenugreek') || el.innerText.includes('Satvik') || el.innerText.includes('Dining'));
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await snap('03_satvik_dining_specialties.png', 'Public Landing - Satvik Pure Vegetarian Dining');

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);

  // Helper to click a button by text
  async function clickButton(text) {
    return page.evaluate((btnText) => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const target = btns.find(b => b.innerText && b.innerText.includes(btnText));
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, text);
  }

  // Helper to close modal (look for X button or Escape)
  async function closeModal() {
    await page.keyboard.press('Escape');
    await sleep(400);
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button')).filter(b => {
        const svg = b.querySelector('svg');
        const text = b.innerText.trim();
        return (text === '✕' || text === '×' || text === 'Close' || (svg && b.offsetWidth < 50 && b.offsetHeight < 50));
      });
      if (closeButtons.length > 0) {
        closeButtons[closeButtons.length - 1].click();
      }
    });
    await sleep(600);
  }

  // 4. Direct Room Reservation Booking Engine
  await clickButton('Reserve Luxury Room');
  await sleep(1000);
  await snap('04_room_reservation_engine.png', 'Direct Room Reservation Booking Engine Modal');
  await closeModal();

  // 5. 3D Multi-Floor Explorer
  await clickButton('3D Floor Explorer');
  await sleep(1500);
  await snap('05_interactive_3d_floor_tour.png', '3D Multi-Floor Interactive Explorer Modal');
  await closeModal();

  // 6. Maa Majhighariani & Sacred Pilgrimage Darshan Guide
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const b = btns.find(x => x.innerText.includes('Darshan') || x.innerText.includes('Pilgrimage'));
    if (b) b.click();
  });
  await sleep(1000);
  await snap('06_pilgrimage_darshan_advisor.png', 'Spiritual Pilgrimage & Darshan Advisor Modal');
  await closeModal();

  // 7. 24/7 AI Concierge Assistant
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.title === '24/7 AI Concierge' || x.innerText.includes('AI Concierge'));
    if (b) b.click();
  });
  await sleep(1000);
  await snap('07_ai_concierge_assistant.png', '24/7 AI Concierge Assistant Modal');
  await closeModal();

  // 8. Autonomous Bot Fleet
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const b = btns.find(x => x.innerText.includes('Bot Fleet') || x.innerText.includes('Autonomous'));
    if (b) b.click();
  });
  await sleep(1000);
  await snap('08_autonomous_bot_fleet.png', 'Autonomous Bot Fleet Modal');
  await closeModal();

  // --- CANNON KITCHEN POS SYSTEM ---
  console.log('\n--- Navigating Cannon Kitchen POS Subsystems ---');
  await clickButton('Fenugreek Restaurant POS');
  await sleep(1200);

  // 9. POS 18 Tables Floor Grid
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.innerText.includes('Table Grid') || x.innerText.includes('Dining Floor'));
    if (b) b.click();
  });
  await sleep(800);
  await snap('09_pos_18_tables_dining_grid.png', 'Cannon Kitchen POS - 18 Tables Floor Matrix');

  // 10. POS 85-Dish Menu Catalog & Fast Code Punch
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.innerText.includes('Item Catalog') || x.innerText.includes('Full Menu') || x.innerText.includes('Menu'));
    if (b) b.click();
  });
  await sleep(800);
  await snap('10_pos_85_dish_catalog_and_punch.png', 'Cannon Kitchen POS - 85-Dish Catalog & Rapid Code Punch');

  // 11. POS Direct Table Settlement & Dynamic UPI QR Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.innerText.includes('Settle Table') || x.innerText.includes('Direct Table Settlement') || x.innerText.includes('UPI QR'));
    if (b) b.click();
  });
  await sleep(900);
  await snap('11_pos_table_settlement_dynamic_upi.png', 'Cannon Kitchen POS - Direct Table Settlement & Dynamic SBI UPI QR');
  await closeModal(); // close settlement sub-modal

  // 12. POS Live KDS Chef Queue
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.innerText.includes('Kitchen KDS') || x.innerText.includes('Live Orders') || x.innerText.includes('KDS Queue'));
    if (b) b.click();
  });
  await sleep(900);
  await snap('12_pos_live_kds_kitchen_queue.png', 'Cannon Kitchen POS - Live Kitchen Display System (KDS) Chef Queue');

  // 13. POS Daily Item Sales & Quantity Register (Sale ఆ వివరణ)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.innerText.includes('Item Sales') || x.innerText.includes('Quantity Register') || x.innerText.includes('వివరణ'));
    if (b) b.click();
  });
  await sleep(900);
  await snap('13_pos_daily_item_sales_register.png', 'Cannon Kitchen POS - Daily Item Sales & Quantity Register');
  await closeModal(); // close item sales modal
  await closeModal(); // close POS modal

  // --- RECEPTION PMS SUBSYSTEMS ---
  console.log('\n--- Navigating Front Desk PMS Subsystems ---');
  // Switch to Front Desk PMS
  await clickButton('Front Desk PMS');
  await sleep(1500);

  // Helper to click reception sub-tab
  async function clickReceptionTab(tabId) {
    await page.evaluate((id) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.innerText.toLowerCase().includes(id.toLowerCase()));
      if (b) b.click();
    }, tabId);
    await sleep(800);
  }

  // 14. 39-Room Tape Chart Matrix
  await clickReceptionTab('Tape Chart Matrix');
  await snap('14_pms_reception_tape_chart.png', 'Front Desk PMS - 39-Room Tape Chart Matrix');

  // 15. Booking Visualizer & Timeline Calendar
  await clickReceptionTab('Booking Visualizer');
  await snap('15_pms_booking_visualizer_calendar.png', 'Front Desk PMS - Booking Visualizer & Timeline Calendar');

  // 16. Multi-Tier Occupancy Report
  await clickReceptionTab('Occupancy Report');
  await snap('16_pms_occupancy_analytics_report.png', 'Front Desk PMS - Multi-Tier Occupancy Report');

  // 17. Cashier Shift Handover & Night Audit Summary
  await clickReceptionTab('Cashier Shift Handover');
  await snap('17_pms_cashier_shift_handover_audit.png', 'Front Desk PMS - Cashier Shift Handover & Audit');

  // 18. Housekeeping & Linen Turnover Tracker
  await clickReceptionTab('Housekeeping & Linen');
  await snap('18_pms_housekeeping_turnover_board.png', 'Front Desk PMS - Housekeeping Turnover Board');

  // 19. Linen & Room Assets Audit (Part 3)
  await clickReceptionTab('Linen & Room Assets');
  await snap('19_pms_linen_room_assets_audit.png', 'Front Desk PMS - Linen & Room Assets Audit');

  // 20. Staff Attendance & Payroll (Part 1)
  await clickReceptionTab('Staff Attendance');
  await snap('20_pms_staff_attendance_payroll.png', 'Front Desk PMS - Staff Attendance & Payroll');

  // 21. Sarai Act 1867 & Police Register (Form-C)
  await clickReceptionTab('Police Register');
  await snap('21_pms_sarai_act_police_register.png', 'Front Desk PMS - Sarai Act 1867 & Police Register');

  // 22. DPDP Act 2023 Digital Privacy Vault
  await clickReceptionTab('DPDP Act');
  await snap('22_pms_dpdp_privacy_vault.png', 'Front Desk PMS - DPDP Act 2023 Compliance Vault');

  // --- ACCOUNTS & FINANCIAL LEDGER SUBSYSTEMS ---
  console.log('\n--- Navigating Accounts & Financial Ledger ---');
  await clickButton('Accounts Day Book & B2B GST');
  await sleep(1200);

  async function clickAccountsTab(text) {
    await page.evaluate((tabText) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.innerText.toLowerCase().includes(tabText.toLowerCase()));
      if (b) b.click();
    }, text);
    await sleep(800);
  }

  // 23. Audit Reconciler (Zero-Variance)
  await clickAccountsTab('Audit Reconciler');
  await snap('23_accounts_audit_reconciler_zero_var.png', 'Accounts Ledger - Audit Reconciler & Zero-Variance Flash Report');

  // 24. 85-Item Culinary Sales & Kitchen Costing Report
  await clickAccountsTab('Item & Category Sales');
  await snap('24_accounts_85_item_sales_costing.png', 'Accounts Ledger - 85-Item Culinary Sales & Costing Report');

  // 25. Daily Day Book & Cash-Bank Balancing
  await clickAccountsTab('Daily Day Book');
  await snap('25_accounts_daily_day_book.png', 'Accounts Ledger - Daily Day Book & Tender Balancing');

  // 26. Ashok Leyland & Corporate B2B Ledger (₹2.14L)
  await clickAccountsTab('Corporate Ledger');
  await snap('26_accounts_corporate_b2b_ledger.png', 'Accounts Ledger - Ashok Leyland & Corporate B2B Ledger');

  // 27. Monthly GSTR-1 Statement
  await clickAccountsTab('GSTR-1');
  await snap('27_accounts_monthly_gstr1_statement.png', 'Accounts Ledger - Monthly GSTR-1 & B2B GST Statement');
  await closeModal();

  // --- ENTERPRISE OPERATIONAL ENGINES ---
  console.log('\n--- Navigating Enterprise Operational Engines ---');

  // 28. Night Audit Portal Lock
  await clickButton('12 AM Night Audit Lock');
  await sleep(1000);
  await snap('28_night_audit_portal_lock.png', 'Night Audit Portal - 12 AM Roll Over & Financial Lock');
  await closeModal();

  // 29. Executive Director Portal
  await clickButton('Remote Director Portal');
  await sleep(1000);
  await snap('29_director_executive_command_portal.png', 'Executive Director Command Portal - Remote RevPAR Dashboard');
  await closeModal();

  // 30. Mandi Store & Kitchen Inventory
  await clickButton('Mandi Store');
  await sleep(1000);
  await snap('30_mandi_store_inventory_management.png', 'Mandi Store & Central Kitchen Inventory Management');
  await closeModal();

  // 31. Master Folio Split Bill
  await clickButton('Master Folio');
  await sleep(1000);
  await snap('31_master_folio_split_bill_settlement.png', 'IDS Next Master Folio - ₹13,588 Split Folio Demonstration');
  await closeModal();

  // 32. IDeaS SAS G3 RMS Dynamic Pricing Console
  await clickButton('IDeaS G3 RMS Console');
  await sleep(1000);
  await snap('32_ideas_g3_rms_dynamic_pricing.png', 'IDeaS SAS G3 RMS Dynamic Pricing & Yield Management Console');
  await closeModal();

  // 33. Corporate B2B Partner Portal
  await clickButton('Corporate Ledgers');
  await sleep(1000);
  await snap('33_corporate_b2b_booking_portal.png', 'Corporate B2B Partner Contracting & Credit Portal');
  await closeModal();

  // 34. Statutory Legal & Compliance Policies
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const l = links.find(x => x.innerText.includes('Privacy Policy') || x.innerText.includes('Terms'));
    if (l) l.click();
  });
  await sleep(1000);
  await snap('34_statutory_legal_policies.png', 'Statutory Compliance & Legal Policies Modal');
  await closeModal();

  // 35. Dedicated In-Room Guest Mobile Portal (QR Room 204)
  console.log('\n--- Navigating In-Room Guest QR Companion ---');
  await page.goto(`${BASE_URL}/?room=204&source=room_qr`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await snap('35_in_room_guest_qr_companion.png', 'Dedicated In-Room Guest Companion (QR Room 204)');

  console.log('\n🎉 ALL 35 SCREENSHOTS CAPTURED CLEANLY!');
  await browser.close();
}

capture().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
