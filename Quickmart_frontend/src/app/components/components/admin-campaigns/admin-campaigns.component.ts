import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-campaigns.component.html'
})
export class AdminCampaignsComponent {
  newCampaign = {
    name: '',
    targetAudience: 'all_customers',
    subject: '',
    message: ''
  };

  isSending = false;
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  sendCampaign() {
    this.isSending = true;
    this.http.post(`${this.apiUrl}/admin/campaigns`, this.newCampaign, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => {
          this.isSending = false;
          Swal.fire({ text: `Campaign "${data.campaign.name}" queued for sending successfully!`, confirmButtonColor: '#255ff4' });
          this.newCampaign = { name: '', targetAudience: 'all_customers', subject: '', message: '' };
        },
        error: (err) => {
          this.isSending = false;
          Swal.fire({ text: 'Failed to blast campaign', confirmButtonColor: '#255ff4' });
          console.error(err);
        }
      });
  }
}
