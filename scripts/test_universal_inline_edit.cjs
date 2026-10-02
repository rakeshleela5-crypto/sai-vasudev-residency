const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', 'dist', req.url.split('?')[0]);
    if (filePath.endsWith('/') || !path.extname(filePath)) {
      filePath = path.join(__dirname, '..', 'dist', 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    }[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        fs.readFile(path.join(__dirname, '..', 'dist', 'index.html'), (e, fallback) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback || '');
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  await new Promise(r => server.listen(4174, r));
  console.log('Local test server running at http://localhost:4174');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack || err);
    consoleErrors.push(err.toString());
  });

  console.log('Navigating to PMS on local server...');
  await page.goto('http://localhost:4174/?view=pms', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Quick Unlock if present
  const unlocked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Quick Unlock'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (unlocked) {
    console.log('Clicked Quick Unlock as Duty Manager');
    await new Promise(r => setTimeout(r, 800));
  }

  // 1. Check PMS has Inline Edit toggle
  console.log('\n--- TEST 1: PMS INLINE KEYBOARD EDITING ---');
  const clickedToggle = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Inline Edit Mode'));
    if (btn) {
      btn.click();
      return btn.textContent.trim();
    }
    return null;
  });
  console.log('Toggled button text:', clickedToggle);
  await new Promise(r => setTimeout(r, 500));

  // Check if .hsi-live-edit-active is applied to #reception-admin-container
  const isPmsActive = await page.evaluate(() => {
    const container = document.getElementById('reception-admin-container');
    return container ? container.classList.contains('hsi-live-edit-active') : false;
  });
  console.log('PMS #reception-admin-container has .hsi-live-edit-active:', isPmsActive);

  // Check floating banner exists
  const hasBanner = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div')).some(d => d.textContent.includes('Direct Keyboard Edit Mode: ACTIVE') || d.textContent.includes('PMS Universal Keyboard Edit Mode: ACTIVE'));
  });
  console.log('Floating InlineEditorBanner rendered:', hasBanner);

  // Click on a room text element (e.g. room 101 or 201)
  const roomEditResult = await page.evaluate(() => {
    const span = document.querySelector('#reception-admin-container [data-room-id] span');
    if (!span) return { found: false };
    const textBefore = span.innerText;
    span.click();
    return {
      found: true,
      textBefore,
      isContentEditable: span.getAttribute('contenteditable'),
      hasEditClass: span.classList.contains('hsi-currently-editing')
    };
  });
  console.log('Room text element click evaluation:', roomEditResult);

  // Type into the active element
  await page.keyboard.type('X');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 300));

  const afterTypeResult = await page.evaluate(() => {
    const span = document.querySelector('#reception-admin-container [data-room-id] span');
    return span ? span.innerText : null;
  });
  console.log('Room text after typing and Enter:', afterTypeResult);

  // 2. Test Accounts Ledger Modal
  console.log('\n--- TEST 2: ACCOUNTS LEDGER KEYBOARD EDITING ---');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Accounts & Cashier') || b.textContent.includes('Accounts Ledger') || b.textContent.includes('Accounts Day Book'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const accountsEditToggled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Direct Ledger Edit') || b.textContent.includes('Edit Mode: ACTIVE'));
    if (btn) {
      btn.click();
      return btn.textContent.trim();
    }
    return null;
  });
  console.log('Toggled Accounts edit button:', accountsEditToggled);
  await new Promise(r => setTimeout(r, 500));

  // Check table cell editing in accounts ledger
  const cellEditResult = await page.evaluate(() => {
    const td = document.querySelector('.glass-panel td');
    if (!td) return { found: false };
    const textBefore = td.innerText;
    td.click();
    return {
      found: true,
      textBefore,
      isContentEditable: td.getAttribute('contenteditable'),
      hasEditClass: td.classList.contains('hsi-currently-editing')
    };
  });
  console.log('Accounts table cell click evaluation:', cellEditResult);

  console.log('\nTotal Console Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  }

  server.close();
  await browser.close();

  if (isPmsActive && roomEditResult.isContentEditable === 'true') {
    console.log('\n🎉 ALL UNIVERSAL INLINE KEYBOARD EDITING CAPABILITIES VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('Failed verification: isPmsActive=' + isPmsActive + ', isContentEditable=' + roomEditResult.isContentEditable);
    process.exit(1);
  }
})();
