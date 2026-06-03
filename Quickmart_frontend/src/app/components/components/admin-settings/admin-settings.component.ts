import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html'
})
export class AdminSettingsComponent implements OnInit {
  settings: any = {
    platformName: '',
    supportEmail: '',
    commissionRate: 10,
    enableRegistrations: true,
    enableSellerApplications: true,
    maintenanceMode: false,
    currency: 'INR',
    taxRate: 5
  };

  isSaving = false;
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSettings();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadSettings() {
    this.http.get<any>(`${this.apiUrl}/admin/settings`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          if (data) {
            this.settings = data;
          }
        },
        error: (err) => console.error("Failed to load settings", err)
      });
  }

  saveSettings() {
    this.isSaving = true;
    this.http.put(`${this.apiUrl}/admin/settings`, this.settings, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.isSaving = false;
          alert('Global platform settings updated successfully!');
        },
        error: (err) => {
          this.isSaving = false;
          alert('Failed to update settings');
          console.error(err);
        }
      });
  }
}
