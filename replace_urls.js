const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'Quickmart_frontend', 'src'),
  path.join(__dirname, 'Backend')
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      // Skip node_modules and .git
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.html') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

let allFiles = [];
dirs.forEach(d => {
  allFiles = allFiles.concat(walk(d));
});

let changed = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace old domains with new vercel domain
  content = content.replace(/https:\/\/quickmartnexa\.com/g, 'https://quickmartnexa.vercel.app');
  content = content.replace(/https:\/\/qickmartnexa\.com/g, 'https://quickmartnexa.vercel.app');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files changed: ${changed}`);
