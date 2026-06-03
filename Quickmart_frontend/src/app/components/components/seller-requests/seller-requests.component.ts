import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-seller-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-requests.component.html'
})
export class SellerRequestsComponent implements OnInit {
  Math = Math;
  requests: any[] = [];
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  get filteredRequests() {
    if (!this.searchQuery) return this.requests;
    const query = this.searchQuery.toLowerCase();
    return this.requests.filter(req => 
      req.userId?.username?.toLowerCase().includes(query) || 
      req.userId?.email?.toLowerCase().includes(query) ||
      req.storeName?.toLowerCase().includes(query) ||
      req.businessName?.toLowerCase().includes(query)
    );
  }

  get paginatedRequests() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadRequests() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/admin/seller-requests`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  approve(id: string) {
    if (confirm('Approve this seller application?')) {
      this.http.put(`${this.apiUrl}/admin/approve-seller/${id}`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadRequests(),
          error: (err) => alert('Error approving seller.')
        });
    }
  }

  reject(id: string) {
    const reason = prompt('Reason for rejection:');
    if (reason !== null) {
      this.http.put(`${this.apiUrl}/admin/reject-seller/${id}`, { reason }, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadRequests(),
          error: (err) => alert('Error rejecting seller.')
        });
    }
  }
}
