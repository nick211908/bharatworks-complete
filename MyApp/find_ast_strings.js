const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('c:\\Users\\Acer\\Desktop\\Bharatworks\\MyApp\\src\\screens\\Labour\\JobApply.tsx', 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  JSXText(path) {
    const text = path.node.value;
    if (text.trim() && path.parentPath.node.name && path.parentPath.node.name.name !== 'Text') {
       console.log(`FOUND STRAGGLER TEXT: "${text.trim()}" inside <${path.parentPath.node.name.name}> at line ${path.node.loc.start.line}`);
    }
  }
});
