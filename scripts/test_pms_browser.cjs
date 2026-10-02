const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  console.log('Navigating to live production deployment...');
  await page.goto('https://sai-vasudev-residency.pages.dev', { waitUntil: 'networkidle2' });

  // Find the PMS button
  const pmsBtn = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a'));
    const found = all.find(el => el.innerText && el.innerText.includes('PMS'));
    if (found) {
      found.click();
      return found.innerText;
    }
    return null;
  });
  console.log('Clicked PMS element:', pmsBtn);

  await new Promise(r => setTimeout(r, 1500));

  // Check if PIN prompt appeared
  const quickUnlockBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const quickBtn = btns.find(b => b.innerText && b.innerText.includes('Quick Unlock'));
    if (quickBtn) {
      quickBtn.click();
      return true;
    }
    return false;
  });

  if (quickUnlockBtn) {
    console.log('Clicked ⚡ Quick Unlock as Duty Manager!');
    await new Promise(r => setTimeout(r, 3000));
  } else {
    const pinInput = await page.$('input[type="password"]');
    if (pinInput) {
      console.log('PIN prompt detected! Entering 7650...');
      await pinInput.type('7650');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 4000));
    } else {
      console.log('No PIN prompt detected.');
    }
  }

  console.log('Console Errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Has 39-Room Tape Chart Matrix?', text.includes('39-Room') || text.includes('Tape Chart'));
  console.log('Has The Wild Oasis / Today Activity?', text.includes('Today\'s Operational Activity') || text.includes('THE WILD OASIS') || text.includes('ARRIVING TODAY'));
  console.log('Has Operations Settings?', text.includes('Operations & Policy Settings'));
  console.log('Page Header Snippet:\n', text.slice(0, 400));

  await browser.close();
})();
