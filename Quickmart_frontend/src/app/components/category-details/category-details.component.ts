// src/app/category-details/category-details.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CategoriesService, Category } from '../../Services/Categories/categories.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../Services/product/products.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../Services/Cart/cart.service';

declare const bootstrap: any;

@Component({
  selector: 'app-category-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit {
  @ViewChild('catToast') catToastEl?: ElementRef;

  category: Category | undefined;
  products: Product[] = [];
  isLoading = true;

  // Per-product add-to-cart loading state
  addingToCart: Record<string, boolean> = {};

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (!categoryId) return;

    // Fetch category info
    this.categoriesService.getCategoryById(categoryId).subscribe({
      next: (data) => { this.category = data; },
      error: (e) => console.error('Category fetch error:', e)
    });

    // Fetch products in category
    this.categoriesService.getProductsByCategory(categoryId).subscribe({
      next: (data) => {
        this.products = data.map((p, i) => ({
          ...p,
          rating: this.rnd(3, 5),
          reviewCount: Math.floor(Math.random() * 450) + 50,
          discount: i === 0 ? 10 : Math.floor(Math.random() * 35) + 5
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load products.', 'error');
      }
    });
  }

  private rnd(min: number, max: number) {
    return +(Math.random() * (max - min) + min).toFixed(1);
  }

  navigateToProductDetails(id: string) {
    this.router.navigate(['/productdetails', id]);
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const full = Math.floor(rating);
    for (let i = 0; i < full; i++) stars.push('full');
    if (rating % 1 >= 0.5) stars.push('half');
    while (stars.length < 5) stars.push('empty');
    return stars;
  }

  /** Add to cart — inline spinner, no full-page preloader, instant navigate */
  addToCart(productId: string, quantity: number): void {
    if (!productId || quantity < 1) {
      this.showToast('Please select a valid quantity.', 'error');
      return;
    }

    this.addingToCart[productId] = true;

    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        this.addingToCart[productId] = false;
        this.showToast('✅ Added to cart!', 'success');
        this.router.navigate(['/cart']).then(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });   // instant — no artificial delay
      },
      error: (err) => {
        this.addingToCart[productId] = false;
        const msg = err?.error?.message || 'Could not add to cart. Please try again.';
        this.showToast(`❌ ${msg}`, 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.catToastEl) {
      try {
        new bootstrap.Toast(this.catToastEl.nativeElement, { delay: 2500 }).show();
      } catch {}
    }
  }

  hideToast(): void {
    try {
      bootstrap.Toast.getInstance(this.catToastEl?.nativeElement)?.hide();
    } catch {}
  }
}