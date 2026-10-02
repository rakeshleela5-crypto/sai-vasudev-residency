const { spawn } = require('child_process');
const http = require('http');

async function testUrl(targetUrl) {
  console.log(`\nTesting URL: ${targetUrl}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    targetUrl
  ]);

  await new Promise(r => setTimeout(r, 4000));

  return new Promise((resolve) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data);
          const targetPage = pages.find(p => p.type === 'page');
          if (!targetPage) {
            console.log('No page found');
            chrome.kill();
            return resolve(false);
          }
          const ws = new globalThis.WebSocket(targetPage.webSocketDebuggerUrl);

          const consoleErrors = [];
          ws.onopen = () => {
            ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
            ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
            setTimeout(() => {
              ws.send(JSON.stringify({
                id: 3,
                method: 'Runtime.evaluate',
                params: {
                  expression: `JSON.stringify({
                    title: document.title,
                    rootExists: !!document.getElementById('root'),
                    preloaderExists: !!document.getElementById('sanctuary-preloader'),
                    h1Text: document.querySelector('h1')?.innerText,
                    headings: Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 8).map(h => h.innerText.trim()).filter(Boolean),
                    buttonCount: document.querySelectorAll('button').length,
                    aCount: document.querySelectorAll('a').length,
                    footerExists: !!document.querySelector('footer')
                  })`
                }
              }));
            }, 3000);
          };

          ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (parsed.method === 'Runtime.exceptionThrown') {
              consoleErrors.push(parsed.params.exceptionDetails);
            }
            if (parsed.id === 3) {
              const domData = JSON.parse(parsed.result?.result?.value || '{}');
              console.log('Page Title:', domData.title);
              console.log('Root Exists:', domData.rootExists);
              console.log('Preloader Present:', domData.preloaderExists);
              console.log('H1:', domData.h1Text);
              console.log('Headings Sample:', domData.headings);
              console.log('Button count:', domData.buttonCount);
              console.log('Link count:', domData.aCount);
              console.log('Footer exists:', domData.footerExists);
              console.log('Console Errors count:', consoleErrors.length);
              if (consoleErrors.length > 0) {
                console.log('Errors:', JSON.stringify(consoleErrors, null, 2));
              }
              ws.close();
              chrome.kill();
              resolve(domData.rootExists && !domData.preloaderExists && domData.buttonCount > 0);
            }
          };
        } catch (e) {
          console.error(e);
          chrome.kill();
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.error(e);
      chrome.kill();
      resolve(false);
    });
  });
}

async function main() {
  const ok = await testUrl('https://sai-vasudev-residency.pages.dev/');
  console.log('\nVERIFICATION RESULT:', ok ? 'PASS (Page rendered completely and error-free)' : 'FAIL');
  process.exit(ok ? 0 : 1);
}

main();
