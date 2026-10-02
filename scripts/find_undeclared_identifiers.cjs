const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = (require('@babel/traverse').default || require('@babel/traverse'));

function getAllFiles(dir, exts) {
  let res = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      res = res.concat(getAllFiles(full, exts));
    } else if (exts.some(e => full.endsWith(e))) {
      res.push(full);
    }
  }
  return res;
}

const STANDARD_GLOBALS = new Set([
  'window', 'document', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'fetch', 'sessionStorage', 'localStorage', 'navigator', 'alert', 'confirm', 'prompt',
  'Date', 'Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'Promise', 'Intl', 'Set', 'Map',
  'JSON', 'RegExp', 'Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError',
  'Event', 'CustomEvent', 'URL', 'URLSearchParams', 'Blob', 'File', 'FileReader', 'FormData',
  'requestAnimationFrame', 'cancelAnimationFrame', 'encodeURIComponent', 'decodeURIComponent',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Infinity', 'NaN', 'undefined', 'null',
  'CSSProperties', 'HTMLButtonElement', 'HTMLSpanElement', 'HTMLDivElement', 'HTMLInputElement', 'HTMLElement',
  'React', 'process', 'global', 'require', 'module', 'exports', '__dirname', '__filename',
  'NodeJS', 'Iterable', 'Record', 'Partial', 'Omit', 'Pick', 'KeyboardEvent', 'MouseEvent', 'FocusEvent',
  'TouchEvent', 'WheelEvent', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver',
  'Audio', 'Image', 'SVGSVGElement', 'SVGElement', 'HTMLCanvasElement', 'CanvasRenderingContext2D',
  'crypto', 'SubtleCrypto', 'CryptoKey', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Int16Array',
  'Uint32Array', 'Int32Array', 'Float32Array', 'Float64Array', 'DataView', 'ArrayBuffer'
]);

const files = getAllFiles('src', ['.jsx', '.tsx', '.js', '.ts']);

const realErrors = [];

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const lines = code.split('\n');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error('Parse error in', file, err.message);
    continue;
  }

  traverse(ast, {
    Identifier(astPath) {
      const name = astPath.node.name;
      // Filter out non-variable identifier contexts:
      const parent = astPath.parent;

      // 1. Member expression property (obj.prop)
      if (parent.type === 'MemberExpression' && parent.property === astPath.node && !parent.computed) return;
      // 2. OptionalMemberExpression (obj?.prop)
      if (parent.type === 'OptionalMemberExpression' && parent.property === astPath.node && !parent.computed) return;
      // 3. Object property key ({ key: val })
      if ((parent.type === 'ObjectProperty' || parent.type === 'ObjectMethod') && parent.key === astPath.node && !parent.computed) return;
      // 4. Object pattern key ({ key: val } = obj)
      if (parent.type === 'Property' && parent.key === astPath.node && !parent.computed) return;
      // 5. Declarations
      if (parent.type === 'VariableDeclarator' && parent.id === astPath.node) return;
      if (parent.type === 'FunctionDeclaration' && parent.id === astPath.node) return;
      if (parent.type === 'FunctionExpression' && parent.id === astPath.node) return;
      if (parent.type === 'ClassDeclaration' && parent.id === astPath.node) return;
      if (parent.type === 'ClassMethod' && parent.key === astPath.node) return;
      if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier' || parent.type === 'ImportNamespaceSpecifier') return;
      if (parent.type === 'ExportSpecifier') return;
      if (parent.type === 'JSXAttribute') return;
      if (parent.type === 'LabeledStatement') return;
      if (parent.type.startsWith('TS')) return;

      // Parameters in functions
      if (astPath.listKey === 'params') return;

      if (!astPath.scope.hasBinding(name) && !STANDARD_GLOBALS.has(name)) {
        const lineNum = astPath.node.loc ? astPath.node.loc.start.line : 0;
        const lineContent = lines[lineNum - 1] ? lines[lineNum - 1].trim() : '';
        realErrors.push({ file, line: lineNum, name, snippet: lineContent });
      }
    },
    JSXIdentifier(astPath) {
      const name = astPath.node.name;
      if (astPath.parent.type === 'JSXOpeningElement' || astPath.parent.type === 'JSXClosingElement') {
        if (name[0] === name[0].toLowerCase()) return;
        if (!astPath.scope.hasBinding(name) && !STANDARD_GLOBALS.has(name)) {
          const lineNum = astPath.node.loc ? astPath.node.loc.start.line : 0;
          const lineContent = lines[lineNum - 1] ? lines[lineNum - 1].trim() : '';
          realErrors.push({ file, line: lineNum, name: `<${name} />`, snippet: lineContent });
        }
      }
    }
  });
}

console.log(`FOUND ${realErrors.length} POTENTIAL RUNTIME BUGS:\n`);
for (const e of realErrors) {
  console.log(`[${e.file}:${e.line}] Missing "${e.name}"`);
  console.log(`   Snippet: ${e.snippet}\n`);
}
