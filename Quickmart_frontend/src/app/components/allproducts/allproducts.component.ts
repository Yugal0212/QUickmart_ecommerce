import Swal from 'sweetalert2';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, ProductService } from '../../Services/product/products.service';
import { CartService } from '../../Services/Cart/cart.service';
import { CategoriesService, Category } from '../../Services/Categories/categories.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';

declare const bootstrap: any;

@Component({
  selector: 'app-allproducts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './allproducts.component.html',
  styleUrls: ['./allproducts.component.css']
})
export class AllproductsComponent implements OnInit {
  @ViewChild('cartToast') cartToastEl?: ElementRef;

  products: any[] = [];
  filteredProducts: any[] = [];
  categories: Category[] = [];
  selectedCategoryId: string | null = null;
  selectedCategoryName: string | null = null;

  isLoading = true;
  categoriesLoading = true;
  isDropdownOpen = false;

  // Per-product loading state (keyed by product._id)
  addingToCart: Record<string, boolean> = {};

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoriesService: CategoriesService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load categories for sidebar filter
    this.categoriesService.getAllCategories().pipe(take(1)).subscribe({
      next: (cats) => { this.categories = cats; this.categoriesLoading = false; },
      error: () => { this.categoriesLoading = false; }
    });

    // Load products — supports ?q= search param
    this.route.queryParamMap
      .pipe(
        map((params) => (params.get('q') || '').trim()),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading = true;
          this.selectedCategoryId = null;
          this.selectedCategoryName = null;
          return query.length >= 2
            ? this.productService.searchProducts(query)
            : this.productService.getAllProducts();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          this.products = this.enrichProducts(data);
          this.filteredProducts = [...this.products];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showToast('Failed to load products.', 'error');
        }
      });
  }

  filterByCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.isDropdownOpen = false;

    if (!categoryId) {
      this.selectedCategoryName = null;
      this.filteredProducts = [...this.products];
      return;
    }

    const cat = this.categories.find(c => c._id === categoryId);
    this.selectedCategoryName = cat?.name ?? null;
    this.isLoading = true;

    this.categoriesService.getProductsByCategory(categoryId).pipe(take(1)).subscribe({
      next: (data) => {
        this.filteredProducts = this.enrichProducts(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load category products.', 'error');
      }
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  private enrichProducts(data: Product[]): any[] {
    return data.map((p, i) => ({
      ...p,
      discount: i === 0 ? 10 : this.getRandomDiscount()
    }));
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const full = Math.floor(rating);
    for (let i = 0; i < full; i++) stars.push('full');
    if (rating % 1 >= 0.5) stars.push('half');
    while (stars.length < 5) stars.push('empty');
    return stars;
  }

  getRandomDiscount()   { return Math.floor(Math.random() * 35) + 5; }

  /** Add to cart — fast inline spinner, no full-page loader, instant redirect */
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
      this.showToast('Please select a valid quantity.', 'error');
      return;
    }

    this.addingToCart[productId] = true;

    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        this.addingToCart[productId] = false;
        this.showToast('✅ Added to cart!', 'success');
        // Navigate instantly — no artificial delay
        this.router.navigate(['/cart']).then(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
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
    if (this.cartToastEl) {
      try {
        const t = new bootstrap.Toast(this.cartToastEl.nativeElement, { delay: 2500 });
        t.show();
      } catch {}
    }
  }

  hideToast(): void {
    try {
      bootstrap.Toast.getInstance(this.cartToastEl?.nativeElement)?.hide();
    } catch {}
  }
}
