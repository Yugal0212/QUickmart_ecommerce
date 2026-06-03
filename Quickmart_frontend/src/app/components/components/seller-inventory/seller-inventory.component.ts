import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-inventory.component.html',
  styleUrls: ['./seller-inventory.component.css']
})
export class SellerInventoryComponent implements OnInit {
  products: any[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';
  updatingId: string | null = null;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchInventory();
  }

  get filteredProducts() {
    if (!this.searchQuery) return this.products;
    const query = this.searchQuery.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query));
  }

  fetchInventory() {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>(`${environment.apiUrl}/products/seller`, { headers }).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.snackBar.open('Failed to load inventory', 'Close', { duration: 3000 });
      }
    });
  }

  updateStock(productId: string, newStock: number) {
    if (newStock < 0) return;
    
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.updatingId = productId;

    this.http.patch(`${environment.apiUrl}/products/stock/${productId}`, { stockQuantity: newStock }, { headers }).subscribe({
      next: () => {
        this.updatingId = null;
        this.snackBar.open('Stock updated successfully', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
      },
      error: () => {
        this.updatingId = null;
        this.snackBar.open('Failed to update stock', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
      }
    });
  }
}
