const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 5174;
const URL = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('--- Launching Vite Preview Server ---');
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });

  await new Promise((resolve) => {
    preview.stdout.on('data', d => {
      process.stdout.write(`[Vite stdout] ${d}`);
      if (d.toString().includes('Local:')) resolve();
    });
    preview.stderr.on('data', d => process.stderr.write(`[Vite stderr] ${d}`));
    setTimeout(resolve, 5000);
  });

  const errors = [];
  const warnings = [];

  console.log('--- Launching Headless Browser ---');
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        errors.push({ source: 'console.error', text });
        console.error('🔴 [Console Error]:', text);
      } else if (type === 'warning') {
        warnings.push({ text });
      }
    });

    page.on('pageerror', err => {
      errors.push({ source: 'pageerror', text: err.message, stack: err.stack });
      console.error('🔥 [Unhandled Page Error]:', err.message);
    });

    console.log(`\nNavigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1000);

    console.log('\n--- Testing Guest View Modals ---');
    // Test 3D Explorer
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('3D'));
      if (btn) btn.click();
    });
    await sleep(1000);
    // Close modal if open
    await page.keyboard.press('Escape');
    await sleep(500);

    // Test Darshan Advisor
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText && b.innerText.includes('Darshan'));
      if (btn) btn.click();
    });
    await sleep(1000);
    await page.keyboard.press('Escape');
    await sleep(500);

    console.log('\n--- Switching to PMS View ---');
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a'));
      const pmsBtn = all.find(el => el.innerText && el.innerText.includes('PMS'));
      if (pmsBtn) pmsBtn.click();
    });
    await sleep(1000);

    // Unlock Duty Manager if locked
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const quick = btns.find(b => b.innerText && b.innerText.includes('Quick Unlock'));
      if (quick) quick.click();
    });
    await sleep(1500);

    console.log('\n--- Testing All PMS Sub-Tabs ---');
    const tabButtons = await page.evaluate(() => {
      const container = document.querySelector('.enterprise-tab-pill')?.parentElement;
      if (!container) return [];
      return Array.from(container.querySelectorAll('button')).map((b, idx) => ({
        index: idx,
        text: b.innerText.trim()
      }));
    });

    console.log(`Found ${tabButtons.length} PMS tabs:`);
    for (const t of tabButtons) {
      console.log(`  -> Clicking tab: "${t.text}"`);
      await page.evaluate((idx) => {
        const container = document.querySelector('.enterprise-tab-pill')?.parentElement;
        if (container) {
          const btns = container.querySelectorAll('button');
          if (btns[idx]) btns[idx].click();
        }
      }, t.index);
      await sleep(1200);

      // Check if Date Filter Modal can be opened on this tab
      const hasDateBtn = await page.evaluate(() => {
        const barBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('CHANGE AUDIT RANGE') || b.innerText.includes('DATE SELECTION')));
        if (barBtn) {
          barBtn.click();
          return true;
        }
        return false;
      });
      if (hasDateBtn) {
        await sleep(500);
        await page.keyboard.press('Escape');
        await sleep(300);
      }
    }

    console.log('\n--- Testing Enterprise Modals & Menus ---');
    // Open Cannon Kitchen POS
    console.log('-> Opening Cannon Kitchen POS');
    await page.evaluate(() => {
      const posBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText && b.innerText.includes('Kitchen POS'));
      if (posBtn) posBtn.click();
    });
    await sleep(1500);

    // Switch POS view modes
    const posModes = ['tableGrid', 'menu', 'liveOrders'];
    for (const mode of posModes) {
      await page.evaluate((m) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => {
          const t = (b.innerText || '').toLowerCase();
          if (m === 'tableGrid' && (t.includes('table') || t.includes('layout'))) return true;
          if (m === 'menu' && (t.includes('menu') || t.includes('fast kot'))) return true;
          if (m === 'liveOrders' && (t.includes('live') || t.includes('kds') || t.includes('display'))) return true;
          return false;
        });
        if (target) target.click();
      }, mode);
      await sleep(800);
    }
    await page.keyboard.press('Escape');
    await sleep(500);

    // Open Accounts Ledger / Tally ERP Modal
    console.log('-> Opening Accounts Ledger / Tally Modal');
    await page.evaluate(() => {
      const accBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText && (b.innerText.includes('Tally') || b.innerText.includes('Accounts')));
      if (accBtn) accBtn.click();
    });
    await sleep(1500);

    // Test subtabs inside Accounts Ledger
    const accTabs = await page.evaluate(() => {
      const modal = document.querySelector('.modal-content, [role="dialog"], .glass-panel');
      if (!modal) return [];
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.filter(b => b.innerText && (b.innerText.includes('Day Book') || b.innerText.includes('Tally') || b.innerText.includes('Ledger') || b.innerText.includes('Audit'))).map(b => b.innerText);
    });
    console.log(`Found accounts tabs:`, accTabs);
    for (const tabText of accTabs) {
      await page.evaluate((txt) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === txt);
        if (btn) btn.click();
      }, tabText);
      await sleep(600);
    }
    await page.keyboard.press('Escape');
    await sleep(500);

    // Open Store & Inventory Modal
    console.log('-> Opening Store Inventory Modal');
    await page.evaluate(() => {
      const invBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText && (b.innerText.includes('Store') || b.innerText.includes('Inventory')));
      if (invBtn) invBtn.click();
    });
    await sleep(1500);
    // Switch inventory tabs
    const storeTabs = ['purchases', 'requisitions', 'vendor-payables', 'recipe-bom'];
    for (const st of storeTabs) {
      await page.evaluate((tabId) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => {
          const t = (b.innerText || '').toLowerCase();
          if (tabId === 'purchases' && t.includes('purchase')) return true;
          if (tabId === 'requisitions' && t.includes('requisition')) return true;
          if (tabId === 'vendor-payables' && (t.includes('vendor') || t.includes('payable'))) return true;
          if (tabId === 'recipe-bom' && (t.includes('recipe') || t.includes('bom'))) return true;
          return false;
        });
        if (btn) btn.click();
      }, st);
      await sleep(600);
    }
    await page.keyboard.press('Escape');
    await sleep(500);

    // Open Revenue Management Modal
    console.log('-> Opening Revenue Management Modal');
    await page.evaluate(() => {
      const revBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText && (b.innerText.includes('Revenue') || b.innerText.includes('RMS') || b.innerText.includes('IDeaS')));
      if (revBtn) revBtn.click();
    });
    await sleep(1500);
    const revTabs = ['yielding', 'seasonal-rules', 'mar', 'investigator', 'sandbox', 'guardrails', 'netrevpar'];
    for (const rt of revTabs) {
      await page.evaluate((tabId) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => {
          const t = (b.innerText || '').toLowerCase();
          if (tabId === 'yielding' && t.includes('yielding')) return true;
          if (tabId === 'seasonal-rules' && t.includes('seasonal')) return true;
          if (tabId === 'mar' && t.includes('mar')) return true;
          if (tabId === 'investigator' && t.includes('pricing')) return true;
          if (tabId === 'sandbox' && t.includes('sandbox')) return true;
          if (tabId === 'guardrails' && t.includes('guardrail')) return true;
          if (tabId === 'netrevpar' && t.includes('netrevpar')) return true;
          return false;
        });
        if (btn) btn.click();
      }, rt);
      await sleep(600);
    }
    await page.keyboard.press('Escape');
    await sleep(500);

    // Open Folio Actions Modal
    console.log('-> Opening Folio Actions Modal');
    await page.evaluate(() => {
      // Find a room button in tape chart or folio button
      const folioBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Folio') || b.innerText.includes('402') || b.innerText.includes('104')));
      if (folioBtn) folioBtn.click();
    });
    await sleep(1500);
    // Click through action items in Folio Actions Modal
    const folioActions = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.filter(b => b.innerText && (b.innerText.includes('Charges') || b.innerText.includes('Advance') || b.innerText.includes('Split') || b.innerText.includes('Checkout') || b.innerText.includes('Late') || b.innerText.includes('Guest'))).map(b => b.innerText);
    });
    console.log('Folio action buttons found:', folioActions);
    for (const act of folioActions) {
      await page.evaluate((txt) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === txt);
        if (btn) btn.click();
      }, act);
      await sleep(400);
    }
    await page.keyboard.press('Escape');
    await sleep(500);

  } finally {
    await browser.close();
    preview.kill();
  }

  console.log('\n======================================================');
  console.log(`TOTAL UNHANDLED ERRORS CAUGHT: ${errors.length}`);
  console.log('======================================================');
  if (errors.length > 0) {
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  } else {
    console.log('✓ Zero runtime errors detected across all tested tabs and modals!');
  }
}

main().catch(err => {
  console.error('Fatal Diagnoser Error:', err);
  process.exit(1);
});
