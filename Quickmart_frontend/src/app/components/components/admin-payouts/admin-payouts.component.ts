import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payouts.component.html'
})
export class AdminPayoutsComponent implements OnInit {
  Math = Math;
  payouts: any[] = [];
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  statusFilter: string = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPayouts();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadPayouts() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/wallet/admin/payouts`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.payouts = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  get filteredPayouts() {
    let filtered = this.payouts;
    
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === this.statusFilter);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.seller?.username?.toLowerCase().includes(query) || 
        item._id?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  get paginatedPayouts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPayouts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredPayouts.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  
  processPayout(payout: any, status: string) {
    let note = '';
    if (status === 'Rejected') {
      note = prompt('Please provide a reason for rejection:') || '';
      if (!note) return;
    } else if (status === 'Completed') {
      note = prompt('Enter transaction reference ID or note (optional):') || '';
    } else if (status === 'Processing') {
      if (!confirm('Mark this payout as Processing?')) return;
    }

    this.http.put(`${this.apiUrl}/wallet/admin/payouts/${payout._id}`, { status, adminNote: note }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.loadPayouts();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update payout status');
        }
      });
  }
}
