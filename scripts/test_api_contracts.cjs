/**
 * REST API CONTRACT & SECURITY INTEGRATION TEST SUITE
 * Hotel Sai International - Cloudflare Pages Edge Function (/api/sync)
 */

const https = require('https');

const TARGET_HOST = 'sai-vasudev-residency.pages.dev';

const agent = new https.Agent({ keepAlive: false });

function requestApi({ method = 'GET', path = '/api/sync', headers = {}, body = null, retries = 2 }) {
  return new Promise((resolve, reject) => {
    const attempt = (remainingRetries) => {
      const options = {
        hostname: TARGET_HOST,
        port: 443,
        path,
        method,
        agent,
        headers: {
          'User-Agent': 'HSI-Contract-Tester/1.0',
          'Accept': 'application/json',
          'Connection': 'close',
          ...headers
        }
      };

      if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      const req = https.request(options, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch {
            json = rawData;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: json
          });
        });
      });

      req.on('error', (err) => {
        if (remainingRetries > 0) {
          setTimeout(() => attempt(remainingRetries - 1), 500);
        } else {
          reject(err);
        }
      });

      req.setTimeout(10000, () => {
        req.destroy();
        if (remainingRetries > 0) {
          setTimeout(() => attempt(remainingRetries - 1), 500);
        } else {
          reject(new Error('Request timeout after 10000ms'));
        }
      });

      if (body) {
        req.write(body);
      }
      req.end();
    };

    attempt(retries);
  });
}

async function runContractTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 HOTEL SAI INTERNATIONAL - API CONTRACT TEST SUITE`);
  console.log(`Target: https://${TARGET_HOST}/api/sync`);
  console.log(`======================================================\n`);

  let totalTests = 0;
  let passedTests = 0;

  // TEST 1: Public GET Catalog without Auth (200 OK, 40 Rooms, Zero Guest PII)
  totalTests++;
  try {
    const res = await requestApi({ method: 'GET' });
    const rooms = res.data?.data?.rooms || [];
    const hasRooms = rooms.length === 40;
    const hasNoGuestNames = rooms.every(r => !r.currentGuestName && !r.guestName && !r.current_guest_name);
    
    if (res.statusCode === 200 && hasRooms && hasNoGuestNames && res.data?.isAdmin === false) {
      console.log(`✓ Test 1 Passed: Public Catalog returns 200 OK, 40 rooms verified, and guest PII strictly omitted.`);
      passedTests++;
    } else {
      console.error(`✗ Test 1 Failed: Status=${res.statusCode}, rooms=${rooms.length}, hasNoGuestNames=${hasNoGuestNames}`);
    }
  } catch (err) {
    console.error(`✗ Test 1 Exception:`, err.message);
  }

  // TEST 2: Security Headers Contract (nosniff, HSTS, CORS)
  totalTests++;
  try {
    const res = await requestApi({ method: 'GET' });
    const hasNosniff = res.headers['x-content-type-options'] === 'nosniff';
    const hasHsts = !!res.headers['strict-transport-security'];
    const hasCors = !!res.headers['access-control-allow-origin'];

    if (hasNosniff && hasHsts && hasCors) {
      console.log(`✓ Test 2 Passed: Strict Security Headers (nosniff, HSTS, CORS) present.`);
      passedTests++;
    } else {
      console.error(`✗ Test 2 Failed: Security headers incomplete:`, res.headers);
    }
  } catch (err) {
    console.error(`✗ Test 2 Exception:`, err.message);
  }

  // TEST 3: Unauthenticated Mutation Attempt (Must return 401 Unauthorized)
  totalTests++;
  try {
    const payload = JSON.stringify({
      action: 'execute_night_audit',
      payload: { businessDate: '2026-09-25' }
    });
    const res = await requestApi({
      method: 'POST',
      body: payload
      // Zero auth header
    });

    if (res.statusCode === 401) {
      console.log(`✓ Test 3 Passed: Unauthenticated mutation rejected with HTTP 401 Unauthorized.`);
      passedTests++;
    } else {
      console.error(`✗ Test 3 Warning/Failed: Status=${res.statusCode}, data=`, res.data);
    }
  } catch (err) {
    console.error(`✗ Test 3 Exception:`, err.message);
  }

  // TEST 4: Invalid Action Payload with Dummy Key (Must return 401 on invalid key or 400 on bad action)
  totalTests++;
  try {
    const payload = JSON.stringify({
      action: 'INVALID_UNKNOWN_ACTION_9999',
      payload: {}
    });
    const res = await requestApi({
      method: 'POST',
      headers: { 'X-Admin-Key': 'invalid_pin_test' },
      body: payload
    });

    if (res.statusCode === 401 || res.statusCode === 400) {
      console.log(`✓ Test 4 Passed: Invalid credentials / malformed action rejected safely with Status ${res.statusCode}.`);
      passedTests++;
    } else {
      console.error(`✗ Test 4 Failed: Expected 401 or 400. Got:`, res.statusCode);
    }
  } catch (err) {
    console.error(`✗ Test 4 Exception:`, err.message);
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`📊 RESULTS: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`------------------------------------------------------\n`);

  process.exit(passedTests === totalTests ? 0 : 1);
}

runContractTests();
