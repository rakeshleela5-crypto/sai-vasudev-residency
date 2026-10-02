/**
 * MASTER QA & RESILIENCE TEST ORCHESTRATOR
 * Hotel Sai International - Rayagada, Odisha
 * Runs all 5 Quality Engineering Pillars (#18, #19, #20, #21, #22) in sequence
 */

const { execSync } = require('child_process');

const SUITES = [
  { id: '#20', name: 'Strict Test-Driven Development (TDD) Unit Suite', script: 'scripts/tdd_unit_suite.cjs' },
  { id: '#21', name: 'REST API Contract & Security Integration Suite', script: 'scripts/api_contract_suite.cjs' },
  { id: '#22', name: 'Chaos & Fault-Tolerance Testing Suite', script: 'scripts/chaos_fault_tolerance_suite.cjs' },
  { id: '#18 & #19', name: 'End-to-End Browser Automation & Anti-Flake Suite', script: 'scripts/e2e_browser_suite.cjs' }
];

console.log('\n======================================================================');
console.log('  🏛️ HOTEL SAI INTERNATIONAL - 5-PILLAR QA & RESILIENCE MASTER SUITE');
console.log('======================================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of SUITES) {
  console.log(`\n======================================================================`);
  console.log(`  RUNNING SUITE ${suite.id}: ${suite.name}`);
  console.log(`======================================================================`);
  const start = Date.now();
  try {
    execSync(`node ${suite.script}`, { stdio: 'inherit' });
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    results.push({ id: suite.id, name: suite.name, status: 'PASSED', duration: `${duration}s` });
    totalPassed++;
  } catch (err) {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    results.push({ id: suite.id, name: suite.name, status: 'FAILED', duration: `${duration}s` });
    totalFailed++;
  }
}

console.log('\n======================================================================');
console.log('  📊 FINAL 5-PILLAR QA & RESILIENCE SCORECARD');
console.log('======================================================================');
console.table(results);

console.log(`\nSUMMARY: ${totalPassed} SUITES PASSED | ${totalFailed} SUITES FAILED\n`);

if (totalFailed > 0) {
  process.exit(1);
}
