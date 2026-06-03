import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { Product, ProductService } from '../../Services/product/products.service';
import { CommonModule, NgIf } from '@angular/common';
import { CartService } from '../../Services/Cart/cart.service';

@Component({
  selector: 'app-best-selling',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './best-selling.component.html',
  styleUrls: ['./best-selling.component.css']
})
export class BestSellingComponent implements OnInit {

  bestSellingProducts: Product[] = [];
  isLoading: boolean = true;
  addingToCart: { [key: string]: boolean } = {}; // Per-product spinner loading map

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    // Inject CartService
    private router: Router ,
    // Inject Router
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchBestSellingProducts();
  }

  fetchBestSellingProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        // Add random rating, review count, and discount to each product
        this.bestSellingProducts = data.map((product, index) => {
          return {
            ...product,
            rating: this.getRandomRating(),
            reviewCount: this.getRandomReviewCount(),
            discount: index === 0 ? 10 : this.getRandomDiscount() // First product has 10% discount, others random
          };
        });

        // Sort and get the top 10 best-selling products
        this.bestSellingProducts = this.getTop10BestSellingProducts(this.bestSellingProducts);
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching products', error);
        this.isLoading = false;
      }
    );
  }

  // Generate a random rating between 1.0 and 5.0
  getRandomRating(): number {
    return Math.floor(Math.random() * 50) / 10 + 1;
  }

  // Generate a random review count between 50 and 500
  getRandomReviewCount(): number {
    return Math.floor(Math.random() * 450) + 50;
  }

  // Generate a random discount between 10% and 50%
  getRandomDiscount(): number {
    return Math.floor(Math.random() * 40) + 10;
  }

  // Method to get the top 10 best-selling products
  getTop10BestSellingProducts(products: Product[]): Product[] {
    // Sort products by a criterion (e.g., sales count, rating, or discount)
    return products
      .sort((a, b) => b.rating - a.rating) // Sort by rating (highest first)
      .slice(0, 10); // Get the top 10 products
  }

  // Method to generate star ratings
  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    if (halfStar) {
      stars.push('half');
    }
    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  // Method to handle "Add to Cart" button click
  addToCart(productId: string, quantity: number): void {
    if (!this.authService.getAccessToken()) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'You must register or login first before shopping!',
        confirmButtonText: 'Go to Register',
        confirmButtonColor: '#255ff4',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login/sign-up']);
        }
      });
      return;
    }

    if (!productId || quantity < 1) {
      Swal.fire({ text: 'Invalid product or quantity.', confirmButtonColor: '#255ff4' });
      return;
    }

    this.addingToCart[productId] = true; // Show per-product inline loader

    this.cartService.addToCart(productId, quantity).subscribe({
      next: (response) => {
        console.log('Product added to cart:', response);
        this.addingToCart[productId] = false;
        this.router.navigate(['/cart']).then(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
        this.addingToCart[productId] = false;
        if (error.error && error.error.message) {
          Swal.fire({ text: `Error: ${error.error.message}`, confirmButtonColor: '#255ff4' });
        } else {
          Swal.fire({ text: 'Failed to add product to cart. Please try again.', confirmButtonColor: '#255ff4' });
        }
      }
    });
  }
}
