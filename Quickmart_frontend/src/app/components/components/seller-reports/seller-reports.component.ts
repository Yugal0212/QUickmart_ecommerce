import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';

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
}
