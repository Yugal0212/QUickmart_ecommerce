import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-banners.component.html'
})
export class AdminBannersComponent implements OnInit {
  banners: any[] = [];
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;

  showCreateModal: boolean = false;
  isSaving: boolean = false;
  newBanner: any = {
    title: '',
    imageUrl: '',
    link: '',
    order: 0,
    isActive: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadBanners() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/admin/banners`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.banners = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  saveBanner() {
    this.isSaving = true;
    this.http.post(`${this.apiUrl}/admin/banners`, this.newBanner, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeCreateModal();
          this.loadBanners();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to create banner');
          this.isSaving = false;
        }
      });
  }

  deleteBanner(id: string) {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.http.delete(`${this.apiUrl}/admin/banners/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.loadBanners();
          },
          error: (err) => {
            console.error(err);
            alert('Failed to delete banner');
          }
        });
    }
  }

  toggleBannerStatus(banner: any) {
    const updatedStatus = !banner.isActive;
    this.http.put(`${this.apiUrl}/admin/banners/${banner._id}`, { isActive: updatedStatus }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          banner.isActive = updatedStatus;
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update status');
        }
      });
  }
}
