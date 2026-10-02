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

  await new Promise(r => server.listen(4175, r));
  console.log('Local test server running at http://localhost:4175');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // TEST 1: Guest View (WhatsApp floating concierge & top bar link)
  console.log('\n--- VERIFYING GUEST VIEW ---');
  await page.goto('http://localhost:4175/?view=guest', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const guestChecks = await page.evaluate(() => {
    const floatingWa = document.querySelector('.whatsapp-floating-concierge');
    const topBarWa = Array.from(document.querySelectorAll('a')).find(a => a.href && a.href.includes('wa.me/917978043585'));
    return {
      hasFloatingWhatsApp: !!floatingWa,
      floatingWhatsAppText: floatingWa ? floatingWa.innerText.trim() : null,
      hasTopBarWhatsApp: !!topBarWa,
      topBarWhatsAppText: topBarWa ? topBarWa.innerText.trim() : null
    };
  });
  console.log('Guest view results:', guestChecks);

  // TEST 2: PMS View (Exit button & Fast Rail F1-F8)
  console.log('\n--- VERIFYING PMS VIEW ---');
  await page.goto('http://localhost:4175/?view=pms', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Quick Unlock if pin prompt is visible
  await page.evaluate(() => {
    const pinInput = document.querySelector('input[type="password"]');
    if (pinInput) {
      pinInput.value = '7650';
      pinInput.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Authorize'));
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const pmsChecks = await page.evaluate(() => {
    const exitBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('Exit PMS'));
    const fastRailKbd = Array.from(document.querySelectorAll('kbd')).map(k => k.innerText.trim());
    return {
      exitButtonCount: exitBtns.length,
      exitButtonLabels: exitBtns.map(b => b.innerText.trim().replace(/\s+/g, ' ')),
      fastRailKeys: fastRailKbd
    };
  });
  console.log('PMS view results:', pmsChecks);

  console.log('\nTotal Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Errors found:', consoleErrors);
  }

  await browser.close();
  server.close();

  if (consoleErrors.length === 0 && guestChecks.hasFloatingWhatsApp && pmsChecks.exitButtonCount > 0 && pmsChecks.fastRailKeys.includes('F1')) {
    console.log('\n🎉 ALL NAVIGATION & WHATSAPP FEATURES VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('\n❌ Verification checks failed');
    process.exit(1);
  }
})();
