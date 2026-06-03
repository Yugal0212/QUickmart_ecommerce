import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  Math = Math;
  activeTab: 'active' | 'pending' | 'rejected' = 'active';
  
  products: any[] = [];
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
    this.http.get<any[]>(`${this.apiUrl}/admin/products`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  switchTab(tab: 'active' | 'pending' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchQuery = '';
  }

  get currentDataList() {
    const statusMap: any = {
      'active': 'approved',
      'pending': 'pending',
      'rejected': 'rejected'
    };
    return this.products.filter(p => p.approvalStatus === statusMap[this.activeTab]);
  }

  get filteredData() {
    if (!this.searchQuery) return this.currentDataList;
    const query = this.searchQuery.toLowerCase();
    return this.currentDataList.filter(item => 
      item.name?.toLowerCase().includes(query) || 
      item.seller?.username?.toLowerCase().includes(query)
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
    if (confirm('Approve this product? It will go live immediately.')) {
      this.http.put(`${this.apiUrl}/admin/approve-product/${id}`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadData(),
          error: (err) => alert('Error approving product.')
        });
    }
  }

  reject(id: string) {
    const reason = prompt('Reason for rejection:');
    if (reason !== null) {
      this.http.put(`${this.apiUrl}/admin/reject-product/${id}`, { reason }, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadData(),
          error: (err) => alert('Error rejecting product.')
        });
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to completely delete this product? This action cannot be undone.')) {
      this.http.delete(`${this.apiUrl}/seller/products/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => this.loadData(),
          error: (err) => alert('Error deleting product.')
        });
    }
  }

  selectedProduct: any = null;
  showModal: boolean = false;

  viewProductDetails(id: string) {
    this.selectedProduct = this.products.find(p => p._id === id);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }
}
