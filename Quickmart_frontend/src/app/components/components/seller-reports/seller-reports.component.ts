import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-seller-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-reports.component.html',
  styleUrls: ['./seller-reports.component.css']
})
export class SellerReportsComponent implements OnInit {
  analytics: any = null;
  isLoading: boolean = true;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${environment.apiUrl}/seller/analytics`, { headers }).subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  downloadCSV() {
    if (!this.analytics) return;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let csvContent = "data:text/csv;charset=utf-8,Month,Revenue\n";
    months.forEach((month, index) => {
      csvContent += `${month},${this.analytics.monthlyRevenue[index]}\n`;
    });
    csvContent += `\nMetric,Value\n`;
    csvContent += `Total Revenue,${this.analytics.totalRevenue}\n`;
    csvContent += `Total Orders,${this.analytics.totalOrders}\n`;
    csvContent += `Delivered Orders,${this.analytics.deliveredOrders}\n`;
    csvContent += `Active Products,${this.analytics.activeProducts}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "seller_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPDF() {
    if (!this.analytics) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Seller Analytics Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Products', this.analytics.totalProducts],
        ['Active Products', this.analytics.activeProducts],
        ['Total Orders', this.analytics.totalOrders],
        ['Delivered Orders', this.analytics.deliveredOrders],
        ['Total Revenue', `INR ${this.analytics.totalRevenue}`],
        ['Total Customers', this.analytics.totalCustomers],
      ],
      theme: 'grid'
    });
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, i) => [month, `INR ${this.analytics.monthlyRevenue[i]}`]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Month', 'Revenue']],
      body: monthlyData,
      theme: 'grid'
    });

    doc.save('seller_report.pdf');
  }
}
