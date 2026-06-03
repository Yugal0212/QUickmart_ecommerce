import Swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { ProductService } from '../../Services/product/products.service';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { CartService } from '../../Services/Cart/cart.service';

@Component({
  selector: 'app-just-arrived',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './just-arrived.component.html',
  styleUrls: ['./just-arrived.component.css'],
})
export class JustArrivedComponent implements OnInit, AfterViewInit {
  justArrivedProducts: any[] = [];
  isLoading: boolean = true;
  addingToCart: { [key: string]: boolean } = {}; // Per-product spinner loading map

  private swiper: Swiper | undefined;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    // Inject CartService
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchJustArrivedProducts();
  }

  ngAfterViewInit(): void {
    // Initialize Swiper after the view is fully initialized
    this.initializeSwiper();
  }

  fetchJustArrivedProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data: any[]) => {
        // Sort products by creation date (newest first)
        const sortedProducts = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Add random rating, review count, and discount to each product
        this.justArrivedProducts = sortedProducts.map((product, index) => {
          return {
            ...product,
            rating: this.getRandomRating(),
            reviewCount: this.getRandomReviewCount(),
            discount: index === 0 ? 10 : this.getRandomDiscount(), // First product has 10% discount, others random
          };
        });

        // Get the top 8 just arrived products
        this.justArrivedProducts = this.justArrivedProducts.slice(0, 8);
        this.isLoading = false;

        // Reinitialize Swiper after data is loaded
        this.initializeSwiper();
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

  // Initialize Swiper
  initializeSwiper(): void {
    if (this.swiper && typeof this.swiper.destroy === 'function') {
      this.swiper.destroy(true, true); // Destroy existing Swiper instance if it exists
    } else if (Array.isArray(this.swiper)) {
      this.swiper.forEach(s => {
        if (s && typeof s.destroy === 'function') s.destroy(true, true);
      });
    }

    // Initialize Swiper with navigation and responsive breakpoints
    this.swiper = new Swiper('.just-arrived-swiper', {
      modules: [Navigation],
      slidesPerView: 4,
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-next',
        prevEl: '.swiper-prev',
      },
      breakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 4 },
      },
    });
  }

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
    this.addingToCart[productId] = true; // Show per-product loader

    console.log('Adding to cart:', { productId, quantity });

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
          Swal.fire({ text: `Error: ${error.error.message}`, confirmButtonColor: '#255ff4' }); // Show backend error message
        } else {
          Swal.fire({ text: 'Failed to add product to cart. Please try again.', confirmButtonColor: '#255ff4' });
        }
      }
    });
  }
}