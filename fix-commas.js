const fs = require('fs');
const path = require('path');

const files = [
  'Quickmart_frontend/src/app/components/just-arrived/just-arrived.component.ts',
  'Quickmart_frontend/src/app/components/featured-product/featured-product.component.ts',
  'Quickmart_frontend/src/app/components/category-details/category-details.component.ts',
  'Quickmart_frontend/src/app/components/best-selling/best-selling.component.ts',
  'Quickmart_frontend/src/app/components/allproducts/allproducts.component.ts'
].map(f => path.join(__dirname, f));

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  
  let content = fs.readFileSync(f, 'utf8');
  
  // Fix the comment comma issue:
  // "private router: Router // Inject Router," -> "private router: Router,"
  // "private authService: AuthService" -> "private authService: AuthService"
  
  // Actually, I can just replace `// Inject Router,` with `, // Inject Router`
  // But wait, the previous parameter might have had any comment.
  // The script previously appended `,` to `private router: Router // Inject Router`.
  
  // A safer fix: find any line ending with `// some comment,` and replace it with `, // some comment`
  content = content.replace(/(\/\/[^\n]+),\n\s*private authService: AuthService/g, ",\n    $1\n    private authService: AuthService");
  
  // Let's also handle the case where it just ended up as `// Inject Router,\n    private authService`
  content = content.replace(/(\/\/[^\n]*?),(\n\s*private authService: AuthService)/g, ", $1$2");

  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed syntax in', f);
});
