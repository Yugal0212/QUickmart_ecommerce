import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.component.html'
})
export class AdminReportsComponent {
  isGenerating: boolean = false;
  
  reports = [
    { name: 'Monthly Financial Summary', type: 'PDF', date: new Date(), size: '2.4 MB' },
    { name: 'Seller Payouts Export', type: 'CSV', date: new Date(Date.now() - 86400000), size: '156 KB' },
    { name: 'Inventory Deficit Report', type: 'CSV', date: new Date(Date.now() - 172800000), size: '89 KB' },
    { name: 'Q1 Platform Growth', type: 'PDF', date: new Date(Date.now() - 2592000000), size: '5.1 MB' }
  ];

  generateReport(type: string) {
    this.isGenerating = true;
    
    // Simulate generation time
    setTimeout(() => {
      this.isGenerating = false;
      this.reports.unshift({
        name: `New ${type} Report`,
        type: type === 'financial' ? 'PDF' : 'CSV',
        date: new Date(),
        size: '1.2 MB'
      });
      Swal.fire({ text: 'Report generated successfully! (Mocked)', confirmButtonColor: '#255ff4' });
    }, 1500);
  }
}
