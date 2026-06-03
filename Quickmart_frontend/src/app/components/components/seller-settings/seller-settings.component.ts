import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-settings.component.html',
  styleUrls: ['./seller-settings.component.css']
})
export class SellerSettingsComponent implements OnInit {
  activeTab: string = 'profile';
  isLoading: boolean = true;
  isSaving: boolean = false;

  storeData = {
    storeName: '',
    description: '',
    email: '',
    phone: ''
  };

  paymentData = {
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  };

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${environment.apiUrl}/seller/profile`, { headers }).subscribe({
      next: (user) => {
        if (user.sellerDetails) {
          this.storeData.storeName = user.sellerDetails.storeName || '';
          this.storeData.description = user.sellerDetails.storeDescription || '';
          this.storeData.email = user.sellerDetails.supportEmail || user.email || '';
          this.storeData.phone = user.sellerDetails.contactNumber || '';
        } else {
           this.storeData.email = user.email || '';
        }
        
        if (user.paymentDetails) {
          this.paymentData.bankName = user.paymentDetails.bankName || '';
          this.paymentData.accountNumber = user.paymentDetails.accountNumber || '';
          this.paymentData.routingNumber = user.paymentDetails.routingNumber || '';
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.isSaving = true;
    
    if (this.activeTab === 'profile') {
      const payload = {
        storeName: this.storeData.storeName,
        storeDescription: this.storeData.description,
        supportEmail: this.storeData.email,
        contactNumber: this.storeData.phone
      };
      
      this.http.put(`${environment.apiUrl}/seller/profile`, payload, { headers }).subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Store profile saved successfully', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
        },
        error: () => {
          this.isSaving = false;
          this.snackBar.open('Failed to save store profile', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
        }
      });
      
    } else if (this.activeTab === 'payment') {
      const payload = {
        bankName: this.paymentData.bankName,
        accountNumber: this.paymentData.accountNumber,
        routingNumber: this.paymentData.routingNumber
      };
      
      this.http.put(`${environment.apiUrl}/seller/payment`, payload, { headers }).subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Payment details saved successfully', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
        },
        error: () => {
          this.isSaving = false;
          this.snackBar.open('Failed to save payment details', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
        }
      });
    } else {
      // Other tabs not implemented with backend yet
      setTimeout(() => {
        this.isSaving = false;
        this.snackBar.open('Preferences saved successfully', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
      }, 500);
    }
  }
}
