import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css']
})
export class AdminOverviewComponent implements OnInit {
  analytics: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.errorMessage = "Not authenticated";
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${environment.apiUrl}/admin/analytics`, { headers }).subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Failed to load analytics.";
        this.isLoading = false;
      }
    });
  }
}
