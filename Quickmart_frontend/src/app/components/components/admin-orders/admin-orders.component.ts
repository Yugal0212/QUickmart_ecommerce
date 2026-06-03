import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {
  Math = Math;
  orders: any[] = [];
  isLoading: boolean = true;
  apiUrl = environment.apiUrl;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  statusFilter: string = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadOrders() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/admin/orders`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  get filteredOrders() {
    let filtered = this.orders;
    
    // Status Filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === this.statusFilter);
    }
    
    // Search Query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item._id?.toLowerCase().includes(query) || 
        item.user?.username?.toLowerCase().includes(query) ||
        item.user?.email?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  get paginatedOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  
  selectedOrder: any = null;
  showModal: boolean = false;

  viewOrderDetails(id: string) {
    this.selectedOrder = this.orders.find(o => o._id === id);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }
}
// Forced recompile
