import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-customers.component.html',
  styleUrls: ['./seller-customers.component.css']
})
export class SellerCustomersComponent implements OnInit {
  customers: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>(`${environment.apiUrl}/seller/customers`, { headers }).subscribe({
      next: (data) => {
        this.customers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Failed to load customers.";
        this.isLoading = false;
        this.snackBar.open('Error loading customers', 'Close', { duration: 3000 });
      }
    });
  }
}
