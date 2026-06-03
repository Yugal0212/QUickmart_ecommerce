import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-wallet.component.html'
})
export class AdminWalletComponent implements OnInit {
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;
  
  stats = {
    totalSales: 0,
    totalPlatformRevenue: 0,
    totalPaidOut: 0,
    totalPendingPayouts: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadStats() {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/wallet/admin/stats`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }
}
