const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'src/app/app.routes.ts');
let content = fs.readFileSync(routesPath, 'utf8');

// 1. Extract all component imports
const importRegex = /import\s+{\s*([a-zA-Z0-9_]+)\s*}\s+from\s+['"](.+?)['"];/g;
const imports = {};
let match;
while ((match = importRegex.exec(content)) !== null) {
  if (match[1].endsWith('Component')) {
    imports[match[1]] = match[2];
  }
}

// 2. Replace component: X with loadComponent
for (const [componentName, importPath] of Object.entries(imports)) {
  // Regex to match "component: X" or "component : X"
  const compRegex = new RegExp(`component\\s*:\\s*${componentName}\\b`, 'g');
  if (compRegex.test(content)) {
    content = content.replace(compRegex, `loadComponent: () => import('${importPath}').then(c => c.${componentName})`);
  }
}

// 3. Remove the static imports so they are actually lazy loaded
for (const [componentName, importPath] of Object.entries(imports)) {
  const impRegex = new RegExp(`import\\s+{\\s*${componentName}\\s*}\\s+from\\s+['"]${importPath}['"];?\\n?`, 'g');
  content = content.replace(impRegex, '');
}

fs.writeFileSync(routesPath, content, 'utf8');
console.log('Routes refactored to lazy loading!');
