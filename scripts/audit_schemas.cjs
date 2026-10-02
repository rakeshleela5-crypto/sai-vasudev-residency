const fs = require('fs');

// 1. Read sync.js actions
const syncCode = fs.readFileSync('functions/api/sync.js', 'utf8');
const actionRegex = /action\s*===\s*['"]([^'"]+)['"]/g;
const syncActions = [];
let match;
while ((match = actionRegex.exec(syncCode)) !== null) {
  syncActions.push(match[1]);
}
console.log('--- SYNC.JS ACTIONS (' + syncActions.length + ') ---');
console.log(syncActions);

// 2. Read all tables touched in sync.js
const tableRegex = /(?:FROM|INTO|UPDATE|TABLE)\s+([a-zA-Z0-9_]+)/gi;
const syncTables = new Set();
while ((match = tableRegex.exec(syncCode)) !== null) {
  const tbl = match[1].toLowerCase();
  if (!['set', 'where', 'values', 'select', 'if', 'the', 'not', 'null', 'as', 'inner', 'left', 'join', 'order', 'group'].includes(tbl)) {
    syncTables.add(tbl);
  }
}
console.log('\n--- TABLES TOUCHED IN SYNC.JS (' + syncTables.size + ') ---');
console.log([...syncTables].sort());

// 3. Scan frontend for fetch('/api/sync') actions
const srcFiles = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const p = dir + '/' + item;
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.ts') || p.endsWith('.tsx')) {
      srcFiles.push(p);
    }
  }
}
walk('src');

const frontendActions = new Set();
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const feRegex = /action:\s*['"]([^'"]+)['"]/g;
  while ((match = feRegex.exec(content)) !== null) {
    frontendActions.add(match[1]);
  }
}
console.log('\n--- FRONTEND DISPATCHED ACTIONS (' + frontendActions.size + ') ---');
console.log([...frontendActions].sort());

// 4. Missing Actions in sync.js
const missingInSync = [...frontendActions].filter(a => !syncActions.includes(a));
console.log('\n--- ACTIONS DISPATCHED IN FRONTEND BUT MISSING IN SYNC.JS ---');
console.log(missingInSync);

// 5. Find which files dispatch the missing actions
for (const missing of missingInSync) {
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(`action: '${missing}'`) || content.includes(`action: "${missing}"`)) {
      console.log(`Action '${missing}' dispatched in: ${file}`);
    }
  }
}

