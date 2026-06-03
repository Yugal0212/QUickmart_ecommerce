import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './seller-orders.component.html',
  styleUrls: ['./seller-orders.component.css']
})
export class SellerOrdersComponent implements OnInit {
  Math = Math;
  orders: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  updatingOrderId: string | null = null;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  get filteredOrders() {
    if (!this.searchQuery) return this.orders;
    const query = this.searchQuery.toLowerCase();
    return this.orders.filter(o => 
      this.getShortId(o._id).toLowerCase().includes(query) || 
      o.user?.username?.toLowerCase().includes(query) ||
      o.orderStatus?.toLowerCase().includes(query)
    );
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

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.errorMessage = "Not authenticated";
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>(`${environment.apiUrl}/seller/orders`, { headers }).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Failed to load orders.";
        this.isLoading = false;
      }
    });
  }

  getShortId(id: any): string {
    if (!id) return '';
    return id.toString().slice(-6).toUpperCase();
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    this.updatingOrderId = orderId;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.put(`${environment.apiUrl}/order/status/${orderId}`, { orderStatus: newStatus }, { headers }).subscribe({
      next: () => {
        this.snackBar.open(`Order status updated to ${newStatus}`, 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
        // Update local state instead of full fetch for speed
        const order = this.orders.find(o => o._id === orderId);
        if (order) order.orderStatus = newStatus;
        this.updatingOrderId = null;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
        this.updatingOrderId = null;
      }
    });
  }
}
