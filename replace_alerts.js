const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Quickmart_frontend', 'src', 'app', 'components');

function replaceAlerts(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceAlerts(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // Ensure Swal is imported
      if (content.includes('alert(') && !content.includes("import Swal from 'sweetalert2'")) {
        content = "import Swal from 'sweetalert2';\n" + content;
        modified = true;
      }

      // Replace the specific register/login alert
      const loginAlertRegex = /alert\('You must register or login first before shopping!'\);\s*this\.router\.navigate\(\['\/login\/sign-up'\]\);/g;
      if (content.match(loginAlertRegex)) {
        content = content.replace(loginAlertRegex, `Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'You must register or login first before shopping!',
        confirmButtonText: 'Go to Register',
        confirmButtonColor: '#255ff4',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login/sign-up']);
        }
      });`);
        modified = true;
      }

      // Replace other generic alerts
      if (content.includes('alert(')) {
        content = content.replace(/alert\((`[^`]+`|'[^']+'|"[^"]+")\);/g, `Swal.fire({ text: $1, confirmButtonColor: '#255ff4' });`);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated alerts in ${fullPath}`);
      }
    }
  }
}

replaceAlerts(dir);
