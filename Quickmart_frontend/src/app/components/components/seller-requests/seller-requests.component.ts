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
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  selectedRequest: any = null;
  showModal: boolean = false;

  get filteredRequests() {
    let list = this.requests;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      list = list.filter(req => 
        req.fullName?.toLowerCase().includes(query) || 
        req.email?.toLowerCase().includes(query) ||
        req.storeName?.toLowerCase().includes(query) ||
        req.businessName?.toLowerCase().includes(query)
      );
    }
    return list;
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
    this.loadRequests(this.activeTab);
  }

  setTab(tab: 'pending' | 'approved' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchQuery = '';
    this.loadRequests(tab);
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadRequests(status: string) {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/admin/seller-request/${status}`, { headers: this.getHeaders() })
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

  openModal(request: any) {
    this.selectedRequest = request;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
  }

  approve() {
    if (confirm('Are you sure you want to approve this seller application?')) {
      this.http.put(`${this.apiUrl}/admin/seller-request/approve/${this.selectedRequest._id}`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadRequests(this.activeTab);
          },
          error: (err) => alert('Error approving seller.')
        });
    }
  }

  reject() {
    const reason = prompt('Reason for rejection (will be emailed to the seller):');
    if (reason !== null && reason.trim() !== '') {
      this.http.put(`${this.apiUrl}/admin/seller-request/reject/${this.selectedRequest._id}`, { adminRemark: reason }, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadRequests(this.activeTab);
          },
          error: (err) => alert('Error rejecting seller.')
        });
    } else if (reason !== null) {
      alert("A reason is required to reject a seller.");
    }
  }
}
