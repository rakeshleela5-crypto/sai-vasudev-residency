const { spawn } = require('child_process');
const http = require('http');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    'http://localhost:4173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const pages = JSON.parse(data);
        const targetPage = pages.find(p => p.type === 'page' && p.url.includes('4173'));
        const ws = new globalThis.WebSocket(targetPage.webSocketDebuggerUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                expression: `JSON.stringify({
                  rootExists: !!document.getElementById('root'),
                  preloaderExists: !!document.getElementById('sanctuary-preloader'),
                  navExists: !!document.querySelector('nav'),
                  mainExists: !!document.querySelector('main'),
                  footerExists: !!document.querySelector('footer'),
                  bodyChildCount: document.body.children.length,
                  rootChildCount: document.getElementById('root')?.children.length,
                  h1Text: document.querySelector('h1')?.innerText,
                  navbarBrandText: document.querySelector('.font-serif')?.innerText,
                  allHeadings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText)
                })`
              }
            }));
          }, 2000);
        };

        ws.onmessage = (event) => {
          const parsed = JSON.parse(event.data);
          if (parsed.id === 2) {
            console.log('DOM STATE:\n', JSON.parse(parsed.result?.result?.value || '{}'));
          }
        };

        setTimeout(() => {
          ws.close();
          chrome.kill();
          process.exit(0);
        }, 5000);
      } catch (e) {
        console.error('Error:', e);
        chrome.kill();
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error:', err);
    chrome.kill();
  });
}

run();
