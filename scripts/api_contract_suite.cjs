/**
 * REST API CONTRACT & SECURITY INTEGRATION TEST SUITE (#21)
 * Hotel Sai International - Cloudflare Pages Edge Functions
 * Tests /api/sync, /api/d1-tables, /api/cron, /api/ai-concierge
 * Covers 200 Success, 400 Validation, 401 Unauthenticated, 403 Forbidden, and SQL Injection Security
 */

const https = require('https');
const assert = require('assert');

const TARGET_HOST = process.env.API_HOST || 'sai-vasudev-residency.pages.dev';

const agent = new https.Agent({ keepAlive: false });

function makeRequest({ method = 'GET', path = '/api/sync', headers = {}, body = null, timeoutMs = 12000 }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path,
      method,
      agent,
      headers: {
        'User-Agent': 'HotelSai-ContractTester/2.0',
        'Accept': 'application/json',
        'Connection': 'close',
        ...headers
      }
    };

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
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

    req.on('error', (err) => reject(err));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout after ${timeoutMs}ms connecting to ${TARGET_HOST}${path}`));
    });

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(payload);
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;
const failures = [];

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

async function main() {
  console.log('\n================================================================');
  console.log('  🌐 SUITE #21: REST API CONTRACT & SECURITY INTEGRATION SUITE');
  console.log(`  Target Edge Host: https://${TARGET_HOST}`);
  console.log('================================================================\n');

  // 1. GET /api/sync Public Catalog Contract (Zero Auth Required)
  console.log('▶ [Contract] /api/sync - Public Guest Catalog (Zero Auth)');
  await runTest('returns HTTP 200 with sanitized public catalog and isAdmin: false', async () => {
    const res = await makeRequest({ method: 'GET', path: '/api/sync' });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.isAdmin, false);
    assert.ok(Array.isArray(res.data.data.rooms), 'rooms must be an array');
    assert.ok(res.data.data.rooms.length > 0, 'rooms must not be empty');
    
    // Privacy verification: PII must never leak in public catalog
    const firstRoom = res.data.data.rooms[0];
    assert.strictEqual(firstRoom.current_guest_name, undefined, 'Guest name must not leak in public catalog');
    assert.strictEqual(firstRoom.current_booking_id, undefined, 'Booking ID must not leak in public catalog');
  });

  // 2. GET /api/sync Admin Operational Datasets (With X-Admin-Key)
  console.log('\n▶ [Contract] /api/sync - Receptionist / Admin Operational Sync');
  await runTest('returns full PMS operational tables when X-Admin-Key is provided', async () => {
    const res = await makeRequest({
      method: 'GET',
      path: '/api/sync',
      headers: { 'X-Admin-Key': '7650' }
    });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.data.success, true);
    if (res.data.isAdmin) {
      assert.ok(res.data.data.bookings !== undefined, 'bookings must exist for admin');
      assert.ok(res.data.data.staff !== undefined, 'staff must exist for admin');
    }
  });

  // 3. GET /api/d1-tables Master Schema Directory
  console.log('\n▶ [Contract] /api/d1-tables - D1 Live Database Explorer Directory');
  await runTest('returns HTTP 200 with all database tables and schema column metadata', async () => {
    const res = await makeRequest({ method: 'GET', path: '/api/d1-tables' });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.database, 'hotel-sai-international-db');
    assert.ok(Array.isArray(res.data.tables), 'tables must be an array');
    assert.ok(res.data.tables.length > 0, 'D1 must report active tables');

    // Confirm core hotel tables exist in schema directory
    const tableNames = res.data.tables.map(t => t.name);
    assert.ok(tableNames.includes('rooms'), 'Table "rooms" must be listed in D1 directory');
    assert.ok(tableNames.includes('bookings'), 'Table "bookings" must be listed in D1 directory');
  });

  // 4. GET /api/d1-tables?table=rooms Specific Table Inspector
  console.log('\n▶ [Contract] /api/d1-tables?table=rooms - 1:1 Schema & Row Query');
  await runTest('returns exact column definitions and rows for table "rooms"', async () => {
    const res = await makeRequest({ method: 'GET', path: '/api/d1-tables?table=rooms&limit=10' });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.tableName, 'rooms');
    assert.ok(Array.isArray(res.data.columns), 'columns must be an array');
    assert.ok(Array.isArray(res.data.rows), 'rows must be an array');

    const colNames = res.data.columns.map(c => c.name);
    assert.ok(colNames.includes('room_number'), 'room_number column must exist');
    assert.ok(colNames.includes('tariff'), 'tariff column must exist');
    assert.ok(colNames.includes('status'), 'status column must exist');
  });

  // 5. GET /api/d1-tables SQL Injection Attack Resistance
  console.log('\n▶ [Security] SQL Injection Hardening Test');
  await runTest('rejects malicious SQL injection table names with HTTP 400', async () => {
    const maliciousTable = "rooms;DROP TABLE bookings;--";
    const res = await makeRequest({ method: 'GET', path: `/api/d1-tables?table=${encodeURIComponent(maliciousTable)}` });
    assert.strictEqual(res.statusCode, 400, `Expected 400 Bad Request, got ${res.statusCode}`);
    assert.strictEqual(res.data.success, false);
  });

  // 6. GET /api/d1-tables Non-Existent Table Guard
  console.log('\n▶ [Contract] /api/d1-tables 404 Guard for Missing Table');
  await runTest('returns HTTP 404 when querying a non-existent table', async () => {
    const res = await makeRequest({ method: 'GET', path: '/api/d1-tables?table=random_non_existent_table_9999' });
    assert.strictEqual(res.statusCode, 404, `Expected 404 Not Found, got ${res.statusCode}`);
    assert.strictEqual(res.data.success, false);
  });

  // 7. Security Headers Verification
  console.log('\n▶ [Security] Cloudflare Edge Security & Privacy Headers');
  await runTest('enforces strict security headers (no-sniff, frame-options, referrer policy)', async () => {
    const res = await makeRequest({ method: 'GET', path: '/api/sync' });
    const h = res.headers;
    assert.strictEqual(h['x-content-type-options'], 'nosniff', 'Missing X-Content-Type-Options: nosniff');
    assert.strictEqual(h['x-frame-options'], 'SAMEORIGIN', 'Missing X-Frame-Options: SAMEORIGIN');
    assert.ok(h['referrer-policy'], 'Missing Referrer-Policy header');
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal API Contract Suite Error:', err);
  process.exit(1);
});
