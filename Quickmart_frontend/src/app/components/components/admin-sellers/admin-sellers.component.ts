import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sellers.component.html'
})
export class AdminSellersComponent implements OnInit {
  Math = Math;
  activeTab: 'active' | 'pending' = 'active';
  
  pendingRequests: any[] = [];
  activeSellers: any[] = [];
  
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadData() {
    this.isLoading = true;
    
    // Fetch Pending Requests
    this.http.get<any[]>(`${this.apiUrl}/admin/seller-requests`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.pendingRequests = data;
          this.checkLoading();
        },
        error: (err) => {
          console.error(err);
          this.checkLoading();
        }
      });

    // Fetch Active Sellers
    this.http.get<any[]>(`${this.apiUrl}/admin/approved-sellers`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.activeSellers = data;
          this.checkLoading();
        },
        error: (err) => {
          console.error(err);
          this.checkLoading();
        }
      });
  }

  loadingCount = 2;
  checkLoading() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.isLoading = false;
      this.loadingCount = 2; // reset for next load
    }
  }

  switchTab(tab: 'active' | 'pending') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchQuery = '';
  }

  get currentDataList() {
    return this.activeTab === 'active' ? this.activeSellers : this.pendingRequests;
  }

  get filteredData() {
    if (!this.searchQuery) return this.currentDataList;
    const query = this.searchQuery.toLowerCase();
    return this.currentDataList.filter(item => 
      item.userId?.username?.toLowerCase().includes(query) || 
      item.userId?.email?.toLowerCase().includes(query) ||
      item.storeName?.toLowerCase().includes(query) ||
      item.businessName?.toLowerCase().includes(query)
    );
  }

  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  approve(id: string) {
    if (confirm('Approve this seller application?')) {
      this.http.put(`${this.apiUrl}/admin/approve-seller/${id}`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadData(),
          error: (err) => alert('Error approving seller.')
        });
    }
  }

  reject(id: string) {
    const reason = prompt('Reason for rejection:');
    if (reason !== null) {
      this.http.put(`${this.apiUrl}/admin/reject-seller/${id}`, { reason }, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadData(),
          error: (err) => alert('Error rejecting seller.')
        });
    }
  }

  toggleBlock(seller: any) {
    // Hits the same admin/users/:id/block endpoint as users
    const action = seller.userId.isActive === false ? 'unblock' : 'block';
    if (confirm(`Are you sure you want to ${action} this seller's user account?`)) {
      this.http.put(`${this.apiUrl}/admin/users/${seller.userId._id}/${action}`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadData(),
          error: (err) => alert(`Error ${action}ing seller.`)
        });
    }
  }
}
