/**
 * CHAOS & FAULT-TOLERANCE TESTING SUITE (#22)
 * Hotel Sai International - Resilience & Chaos Engineering
 * Tests system behavior under network drops, API 500s, extreme latency & corrupt payloads
 */

const puppeteer = require('puppeteer-core');
const assert = require('assert');

const TARGET_URL = process.env.TEST_URL || 'https://sai-vasudev-residency.pages.dev';
const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let passed = 0;
let failed = 0;
const failures = [];

async function runScenario(name, fn) {
  try {
    console.log(`\n▶ [Chaos Scenario] ${name}`);
    await fn();
    console.log(`  ✓ Passed: System withstood chaos simulation gracefully.`);
    passed++;
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

async function main() {
  console.log('\n================================================================');
  console.log('  ⚡ SUITE #22: CHAOS & FAULT-TOLERANCE TESTING SUITE');
  console.log(`  Target URL: ${TARGET_URL}`);
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const unhandledErrors = [];
    page.on('pageerror', err => unhandledErrors.push(err.toString()));

    // ---------------------------------------------------------------
    // SCENARIO 1: Downstream D1 API 500 Internal Server Error
    // ---------------------------------------------------------------
    await runScenario('API Injects HTTP 500 on /api/sync & /api/d1-tables', async () => {
      await page.setRequestInterception(true);
      
      const interceptor = (req) => {
        try {
          if (req.isInterceptResolutionHandled && req.isInterceptResolutionHandled()) return;
          const url = req.url();
          if (url.includes('/api/sync') || url.includes('/api/d1-tables')) {
            req.respond({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ success: false, error: "Simulated Chaos: D1 Database Unavailable" })
            }).catch(() => {});
          } else {
            req.continue().catch(() => {});
          }
        } catch {}
      };

      page.on('request', interceptor);

      await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

      // Navigate to PMS
      await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('button, a'));
        const found = all.find(el => el.innerText && el.innerText.includes('PMS'));
        if (found) found.click();
      });

      await new Promise(r => setTimeout(r, 1200));

      // Unlock Duty Manager PIN if prompt appears
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const quickBtn = btns.find(b => b.innerText && b.innerText.includes('Quick Unlock'));
        if (quickBtn) quickBtn.click();
      });

      await new Promise(r => setTimeout(r, 1500));

      // Click on D1 Live DB Explorer tab
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const d1Tab = btns.find(b => b.innerText && b.innerText.includes('D1 Live DB Explorer'));
        if (d1Tab) d1Tab.click();
      });

      await new Promise(r => setTimeout(r, 1500));

      // Assert that page did NOT crash with white screen
      const bodyText = await page.evaluate(() => document.body.innerText);
      assert.ok(bodyText.includes('Hotel Sai International') || bodyText.includes('PMS'), 'Page must remain rendered');
      assert.ok(bodyText.includes('FRONTEND MEMORY MIRROR') || bodyText.includes('TABLE "ROOMS"'), 'Must fallback to memory mirror');
      
      // Clean up interception
      page.off('request', interceptor);
      await page.setRequestInterception(false);
    });

    // ---------------------------------------------------------------
    // SCENARIO 2: Complete Network Partition / Offline Simulation
    // ---------------------------------------------------------------
    await runScenario('Full Network Offline Disconnect (Navigator.onLine = false)', async () => {
      // Emulate offline via CDP session
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: true,
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0
      });

      // Attempt interaction while completely offline
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const refreshBtn = btns.find(b => b.innerText && b.innerText.includes('Sync Live From D1'));
        if (refreshBtn) refreshBtn.click();
      });

      await new Promise(r => setTimeout(r, 1000));

      // Assert zero fatal white screen
      const hasContent = await page.evaluate(() => document.body.innerHTML.length > 500);
      assert.strictEqual(hasContent, true, 'App must continue displaying cached state during total network drop');

      // Restore network
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1
      });
      await client.detach();
    });

    // ---------------------------------------------------------------
    // SCENARIO 3: Corrupt JSON / Partial Schema Payload
    // ---------------------------------------------------------------
    await runScenario('API Injects Corrupt / Malformed Schema Payload', async () => {
      await page.setRequestInterception(true);
      
      const corruptInterceptor = (req) => {
        try {
          if (req.isInterceptResolutionHandled && req.isInterceptResolutionHandled()) return;
          if (req.url().includes('/api/d1-tables')) {
            req.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: true, database: "hotel-sai-international-db", tables: null, rows: undefined })
            }).catch(() => {});
          } else {
            req.continue().catch(() => {});
          }
        } catch {}
      };

      page.on('request', corruptInterceptor);

      // Trigger table refresh with corrupted response
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const refreshBtn = btns.find(b => b.innerText && b.innerText.includes('Sync Live From D1'));
        if (refreshBtn) refreshBtn.click();
      });

      await new Promise(r => setTimeout(r, 1200));

      // Assert no unhandled fatal crash
      const fatalErrors = unhandledErrors.filter(e => e.includes('Cannot read properties of') || e.includes('TypeError'));
      assert.strictEqual(fatalErrors.length, 0, `Defensive schema guards must catch corrupt payload: ${fatalErrors.join(', ')}`);

      page.off('request', corruptInterceptor);
      await page.setRequestInterception(false);
    });

    // ---------------------------------------------------------------
    // SCENARIO 4: Recovery After Chaos Injections
    // ---------------------------------------------------------------
    await runScenario('Automatic Self-Healing & Live Re-Sync After Network Recovery', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

      // Unlock PMS
      await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('button, a'));
        const found = all.find(el => el.innerText && el.innerText.includes('PMS'));
        if (found) found.click();
      });

      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const quickBtn = btns.find(b => b.innerText && b.innerText.includes('Quick Unlock'));
        if (quickBtn) quickBtn.click();
      });

      await new Promise(r => setTimeout(r, 1500));

      // Check D1 live status
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const d1Tab = btns.find(b => b.innerText && b.innerText.includes('D1 Live DB Explorer'));
        if (d1Tab) d1Tab.click();
      });

      await new Promise(r => setTimeout(r, 2000));

      const statusText = await page.evaluate(() => document.body.innerText);
      assert.ok(statusText.includes('LIVE D1 REMOTE SYNCED') || statusText.includes('LIVE FRONTEND MEMORY MIRROR'), 'System successfully recovered state');
    });

  } finally {
    await browser.close();
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Chaos Suite Error:', err);
  process.exit(1);
});
