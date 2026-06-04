import Swal from 'sweetalert2';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../Services/product/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../Services/Cart/cart.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule, NgIf, DatePipe } from '@angular/common';
import { SeoService } from '../../Services/seo.service';
import { AuthService } from '../../Services/auth.service';
import { ReviewService } from '../../Services/review.service';

@Component({
  selector: 'app-productdetails',
  imports: [FormsModule, CommonModule, NgIf, DatePipe], // Add FormsModule here
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit, OnDestroy {
  product: any; // Holds the product details
  imageSources: string[] = []; // Holds the product images
  currentIndex: number = 0;
  interval: any;
  quantity: number = 1; // Default quantity
  productPrice: number = 0; // Will be set dynamically based on the product
  isLoading: boolean = true; // Loading state
  addingToCart: boolean = false; // Flag for button loading spinner

  // Reviews Data
  reviews: any[] = [];
  newReview = { rating: 5, comment: '' };
  isSubmittingReview: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private seoService: SeoService,
    public authService: AuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.productService.getProductById(productId).subscribe(
        (data) => {
          this.product = data;
          this.imageSources = this.product.images || []; // Set product images
          this.productPrice = this.product.price; // Set product price
          this.isLoading = false; // Data loaded
          
          // Dynamic SEO Generation
          this.seoService.setSeoData({
            title: this.product.seo?.title || `${this.product.name} | QickmartNexa`,
            description: this.product.seo?.description || this.product.description,
            keywords: this.product.seo?.keywords || this.product.category?.name,
            image: this.product.images?.[0] || '',
            type: 'product.item'
          });

          // Product Schema JSON-LD
          this.seoService.setJsonLdSchema({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": this.product.name,
            "image": this.product.images || [],
            "description": this.product.description,
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "USD",
              "price": this.product.price,
              "availability": this.product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          });

          this.startAutoSlide(); // Start the auto-slide after images are loaded
          this.loadReviews(productId);
        },
        (error) => {
          console.error('Error fetching product details:', error);
          this.product = null; // Set product to null to show an error message in the template
          this.isLoading = false; // Data loading failed
        }
      );
    }
  }

  // Start auto-slide for images
  startAutoSlide(): void {
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.imageSources.length;
    }, 3000); // Change image every 3 seconds
  }

  // Stop auto-slide when the component is destroyed
  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // Change main image on thumbnail click
  changeImage(index: number): void {
    this.currentIndex = index;
  }

  // Increase quantity
  increaseQuantity(): void {
    this.quantity++;
  }

  // Decrease quantity (minimum 1)
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Handle quantity change
  onQuantityChange(): void {
    if (this.quantity < 1) {
      this.quantity = 1; // Ensure quantity is at least 1
    }
  }

  // Calculate total price dynamically
  getTotalPrice(): number {
    return this.productPrice * this.quantity;
  }

  // Add product to cart
  addToCart(productId: string): void {
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

    if (!productId || this.quantity < 1) {
      Swal.fire({ text: 'Invalid product or quantity.', confirmButtonColor: '#255ff4' });
      return;
    }

    console.log('Adding to cart:', { productId, quantity: this.quantity });
    this.addingToCart = true;

    this.cartService.addToCart(productId, this.quantity).subscribe({
      next: (response) => {
        console.log('Product added to cart:', response);
        this.addingToCart = false;
        this.router.navigate(['/cart']).then(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
        this.addingToCart = false;
        const errorMsg = error?.error?.message || error?.message || 'Failed to add product to cart. Please try again.';
        Swal.fire({ text: `Error: ${errorMsg}`, confirmButtonColor: '#255ff4' });
      }
    });
  }

  // REVIEWS LOGIC
  loadReviews(productId: string): void {
    this.reviewService.getProductReviews(productId).subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (err) => console.error('Failed to load reviews', err)
    });
  }

  setRating(val: number): void {
    this.newReview.rating = val;
  }

  submitReview(): void {
    if (!this.authService.getAccessToken()) {
      Swal.fire({ text: 'Please login to submit a review.', icon: 'warning', confirmButtonColor: '#255ff4' });
      return;
    }
    
    if (!this.newReview.comment.trim()) {
      Swal.fire({ text: 'Please write a comment.', icon: 'warning', confirmButtonColor: '#255ff4' });
      return;
    }

    this.isSubmittingReview = true;
    this.reviewService.createReview(this.product._id, this.newReview.rating, this.newReview.comment).subscribe({
      next: (res) => {
        Swal.fire({ title: 'Success', text: 'Review submitted!', icon: 'success', confirmButtonColor: '#255ff4' });
        this.newReview.comment = '';
        this.isSubmittingReview = false;
        this.loadReviews(this.product._id); // Reload reviews to show the new one
      },
      error: (err) => {
        this.isSubmittingReview = false;
        Swal.fire({ title: 'Error', text: err.error?.message || 'Failed to submit review.', icon: 'error', confirmButtonColor: '#255ff4' });
      }
    });
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
  
  getEmptyRatingArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}