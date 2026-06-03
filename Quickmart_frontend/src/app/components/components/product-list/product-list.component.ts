import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Product, ProductService } from '../../../Services/product/products.service';
import { AuthService } from '../../../Services/auth.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  Math = Math;
  products: Product[] = [];
  isLoading: boolean = true; // Add loading state

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private productService: ProductService,
    public authService: AuthService, // Make authService public for template access
    private dialog: MatDialog,
    private router: Router
  ) {}

  get filteredProducts() {
    if (!this.searchQuery) return this.products;
    const query = this.searchQuery.toLowerCase();
    return this.products.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.category.name.toLowerCase().includes(query) ||
      p.seller?.username?.toLowerCase().includes(query)
    );
  }

  get paginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // product-list.component.ts
  loadProducts(): void {
    this.isLoading = true; // Show skeleton loader
    const userRoles = this.authService.getUserRoles();
  
    if (userRoles.includes('seller')) {
      this.productService.getProductsBySeller().subscribe(
        (products) => {
          console.log('Products for Seller:', products); // Debugging
          this.products = products;
          this.isLoading = false; // Hide skeleton loader
        },
        (error) => {
          console.error('Error fetching products:', error);
          this.isLoading = false; // Hide skeleton loader
        }
      );
    } else if (userRoles.includes('admin')) {
      this.productService.getAllProducts().subscribe(
        (products) => {
          console.log('Products for Admin:', products); // Debugging
          this.products = products;
          this.isLoading = false; // Hide skeleton loader
        },
        (error) => {
          console.error('Error fetching products:', error);
          this.isLoading = false; // Hide skeleton loader
        }
      );
    } else {
      console.error('Unauthorized access');
      this.isLoading = false; // Hide skeleton loader
    }
  }

  editProduct(productId: string): void {
    this.router.navigate(['/sheller-dashboard/add-product', { id: productId }]);
  }

  deleteProduct(productId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to delete this product?' },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.productService.deleteProduct(productId).subscribe(
          () => {
            console.log('Product deleted successfully');
            this.loadProducts(); // Refresh the product list
          },
          (error) => {
            console.error('Error deleting product:', error);
          }
        );
      }
    });
  }
}