import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { PreloaderComponent } from '../preloader/preloader.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Product, ProductService } from '../../Services/product/products.service';
import { CategoriesService, Category } from '../../Services/Categories/categories.service';
import { CartService } from '../../Services/Cart/cart.service';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { catchError, filter, of } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, NgIf, NgFor, RouterLink, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @ViewChild('searchWrapper') searchWrapper?: ElementRef<HTMLDivElement>;

  username: string | null = null;
  avatar: string | null = null;
  showPreloader: boolean = false; // Add a flag to control the preloader visibility
  searchControl = new FormControl('');
  productResults: Product[] = [];
  categoryResults: Category[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;
  categories: Category[] = [];
  cartCount: number = 0;


  constructor(
    public authService: AuthService,
    private router: Router,
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Listen to profile and token updates to refresh navbar user data
    this.authService.token.subscribe(() => {
      this.username = this.authService.getUsername();
      this.avatar = localStorage.getItem('avatar');
    });

    this.authService.profileUpdated.subscribe(() => {
      this.username = this.authService.getUsername();
      this.avatar = localStorage.getItem('avatar');
    });

    console.log('Username in component:', this.username); // Debug
    console.log('User roles in component:', this.authService.getUserRoles()); // Debug

    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });

    this.categoriesService.getAllCategories().pipe(take(1)).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      }
    });

    this.searchControl.valueChanges
      .pipe(
        map((value) => (value || '').toString().trim()),
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe((query) => this.handleSearch(query));

    // Fix for offcanvas backdrop not closing properly when clicked
    document.addEventListener('click', (event: any) => {
      if (event.target && event.target.classList && event.target.classList.contains('offcanvas-backdrop')) {
        this.closeMobileMenu();
      }
    });

    // Extremely aggressive cleanup: Whenever route changes, forcibly rip out stuck backdrops
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.closeMobileMenu();
      setTimeout(() => {
        document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove());
        document.body.classList.remove('offcanvas-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 300);
    });
  }

  closeMobileMenu() {
    const offcanvasEl = document.getElementById('offcanvasNavbar');
    if (offcanvasEl) {
      // @ts-ignore
      if (typeof bootstrap !== 'undefined') {
        // @ts-ignore
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) bsOffcanvas.hide();
      }
    }
  }
   
  logout() {
    this.showPreloader = true;
    this.authService.logout().subscribe({
      next: () => {
        setTimeout(() => {
          this.showPreloader = false; // Hide the preloader
          this.router.navigate(['/login']); // Redirect to the cart page
        }, 2000);
       
      },
      error: (err: any) => {
        this.showPreloader = false;
        console.error('Logout failed:', err);
      }
    });
  }

  onSearchSubmit(): void {
    const query = (this.searchControl.value || '').toString().trim();
    if (!query) {
      return;
    }
    this.showSearchResults = false;
    this.router.navigate(['/allproducts'], { queryParams: { q: query } });
  }

  openSearchResults(): void {
    if (this.hasSearchResults()) {
      this.showSearchResults = true;
    }
  }

  closeSearchResults(): void {
    this.showSearchResults = false;
  }

  navigateToProduct(product: Product): void {
    this.showSearchResults = false;
    this.router.navigate(['/productdetails', product._id]);
  }

  navigateToCategory(category: Category): void {
    this.showSearchResults = false;
    this.router.navigate(['/category-details', category._id]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.searchWrapper?.nativeElement.contains(event.target as Node)) {
      this.showSearchResults = false;
    }
  }

  private handleSearch(query: string): void {
    if (query.length < 2) {
      this.productResults = [];
      this.categoryResults = [];
      this.isSearching = false;
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    const loweredQuery = query.toLowerCase();
    this.categoryResults = this.categories
      .filter((category) => category.name.toLowerCase().includes(loweredQuery))
      .slice(0, 5);

    this.productService
      .searchProducts(query)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((products) => {
        this.productResults = products.slice(0, 6);
        this.isSearching = false;
        this.showSearchResults = true;
      });
  }

  private hasSearchResults(): boolean {
    return this.productResults.length > 0 || this.categoryResults.length > 0;
  }
}