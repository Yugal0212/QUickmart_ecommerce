import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-coupons.component.html'
})
export class AdminCouponsComponent implements OnInit {
  Math = Math;
  coupons: any[] = [];
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  statusFilter: string = 'all'; // 'all', 'active', 'expired'
  
  // Modal state
  showCreateModal: boolean = false;
  isSaving: boolean = false;
  newCoupon: any = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: null,
    minPurchaseAmount: 0,
    maxDiscountAmount: null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    usageLimit: null
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadCoupons() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/admin/coupons`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.coupons = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  get filteredCoupons() {
    let filtered = this.coupons;
    
    // Status Filter
    const now = new Date().getTime();
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(c => c.isActive && new Date(c.endDate).getTime() > now);
    } else if (this.statusFilter === 'expired') {
      filtered = filtered.filter(c => !c.isActive || new Date(c.endDate).getTime() <= now);
    }
    
    // Search Query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.code?.toLowerCase().includes(query) || 
        item.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  get paginatedCoupons() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCoupons.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredCoupons.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  
  openCreateModal() {
    this.showCreateModal = true;
  }
  
  closeCreateModal() {
    this.showCreateModal = false;
  }
  
  saveCoupon() {
    this.isSaving = true;
    this.http.post(`${this.apiUrl}/admin/coupons`, this.newCoupon, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          this.showCreateModal = false;
          this.loadCoupons();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to create coupon: ' + (err.error?.message || err.message));
          this.isSaving = false;
        }
      });
  }
  
  deleteCoupon(id: string) {
    if (confirm('Are you sure you want to delete this coupon?')) {
      this.http.delete(`${this.apiUrl}/admin/coupons/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.loadCoupons();
          },
          error: (err) => {
            console.error(err);
            alert('Failed to delete coupon');
          }
        });
    }
  }
  
  toggleCouponStatus(coupon: any) {
    const updatedStatus = !coupon.isActive;
    this.http.put(`${this.apiUrl}/admin/coupons/${coupon._id}`, { isActive: updatedStatus }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          coupon.isActive = updatedStatus;
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update status');
        }
      });
  }
  
  isExpired(dateStr: string): boolean {
    return new Date(dateStr).getTime() < new Date().getTime();
  }
}
