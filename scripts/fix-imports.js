const fs = require('fs');
const path = require('path');

// Helper to recursively get all .js files
function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsFiles(filePath));
    } else if (path.extname(file) === '.js') {
      results.push(filePath);
    }
  });
  
  return results;
}

// Convert import/export statements to CommonJS
function convertToCommonJS(content) {
  // Convert dynamic imports
  content = content.replace(/import\((.*?)\)/g, 'require($1)');
  
  // Convert import statements
  content = content.replace(/import\s+(\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g, (match, imports, path) => {
    if (imports.startsWith('{')) {
      // Named imports
      const names = imports.slice(1, -1).split(',').map(n => n.trim());
      return `const ${imports} = require('${path}');`;
    } else if (imports.startsWith('*')) {
      // Namespace imports
      const name = imports.split('as')[1].trim();
      return `const ${name} = require('${path}');`;
    } else {
      // Default import
      return `const ${imports} = require('${path}');`;
    }
  });

  // Convert export statements
  content = content.replace(/export\s+default\s+/, 'module.exports = ');
  content = content.replace(/export\s+const\s+(\w+)/g, 'exports.$1');
  content = content.replace(/export\s+\{([^}]+)\}/g, (match, exports) => {
    const names = exports.split(',').map(n => n.trim());
    return names.map(name => `exports.${name} = ${name};`).join('\n');
  });
  
  return content;
}

// Process all JS files in dist/server
const serverDir = path.join(process.cwd(), 'dist', 'server');
const jsFiles = getJsFiles(serverDir);

jsFiles.forEach(file => {
  console.log(`Processing ${path.relative(process.cwd(), file)}`);
  const content = fs.readFileSync(file, 'utf8');
  const commonJSContent = convertToCommonJS(content);
  fs.writeFileSync(file, commonJSContent);
});
