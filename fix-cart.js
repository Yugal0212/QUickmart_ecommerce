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
  
  // 1. Import AuthService if not exists
  if (!content.includes('AuthService')) {
    // Replace the first import { Component } from '@angular/core';
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*'@angular\/core';/, (match) => {
      return match + "\nimport { AuthService } from '../../Services/auth.service';";
    });
  }

  // 2. Inject AuthService into constructor
  if (!content.includes('authService: AuthService')) {
    content = content.replace(/constructor\s*\(([^)]*)\)/, (match, args) => {
      const parts = args.split(',').map(s => s.trim()).filter(s => s);
      parts.push('private authService: AuthService');
      return `constructor(\n    ${parts.join(',\n    ')}\n  )`;
    });
  }

  // 3. Add guard to addToCart
  if (!content.includes('if (!this.authService.getAccessToken())')) {
    content = content.replace(/addToCart\s*\(([^)]+)\)\s*(:\s*void)?\s*\{/, match => {
      return `${match}\n    if (!this.authService.getAccessToken()) {\n      alert('You must register or login first before shopping!');\n      this.router.navigate(['/login/sign-up']);\n      return;\n    }\n`;
    });
  }

  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed', f);
});
