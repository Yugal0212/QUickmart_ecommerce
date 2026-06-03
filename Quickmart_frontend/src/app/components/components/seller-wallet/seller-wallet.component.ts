import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-wallet.component.html',
  styleUrls: ['./seller-wallet.component.css']
})
export class SellerWalletComponent implements OnInit {
  wallet: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  withdrawing: boolean = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchWalletDetails();
  }

  fetchWalletDetails() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${environment.apiUrl}/wallet/details`, { headers }).subscribe({
      next: (data) => {
        this.wallet = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Failed to load wallet data.";
        this.isLoading = false;
      }
    });
  }

  requestWithdrawal() {
    if (!this.wallet || this.wallet.availableBalance <= 0) {
      this.snackBar.open('Insufficient available balance', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
      return;
    }
    
    this.withdrawing = true;
    // Mocking an API call for withdrawal
    setTimeout(() => {
      this.withdrawing = false;
      this.snackBar.open('Withdrawal requested successfully. Funds will arrive in 2-3 business days.', 'Close', { duration: 5000, panelClass: ['bg-green-600', 'text-white'] });
    }, 1500);
  }
}
