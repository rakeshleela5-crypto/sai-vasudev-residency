const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.jsx', '.js', '.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(fullPath))) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getAllFiles(path.join(__dirname, '../src'));
let errorsFound = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Check common Lucide icons used in JSX: <IconName
  const jsxIcons = content.match(/<([A-Z][a-zA-Z0-9]+)/g) || [];
  const uniqueTags = [...new Set(jsxIcons.map(t => t.slice(1)))];

  // HTML standard tags to ignore
  const htmlTags = new Set([
    'Fragment', 'Suspense', 'StrictMode', 'App', 'Router', 'Switch', 'Route'
  ]);

  uniqueTags.forEach(tag => {
    if (htmlTags.has(tag)) return;
    // Check if tag is declared or imported
    const importRegex = new RegExp(`\\b${tag}\\b`);
    // Check if it appears in import statement or const/function declaration
    const isImported = /import\s+[\s\S]*?from/.test(content) && importRegex.test(content.slice(0, content.indexOf('export default') || content.length));
    const isDeclared = new RegExp(`(const|let|var|function|class)\\s+${tag}\\b`).test(content);

    if (!isImported && !isDeclared) {
      console.error(`MISSING IDENTIFIER: ${tag} in ${file}`);
      errorsFound++;
    }
  });
});

console.log(`Scan complete. Errors found: ${errorsFound}`);
