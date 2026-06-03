import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.updateCartCount();
  }

  // Method to fetch and update the cart item count reactively
  updateCartCount(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.cartCountSubject.next(0);
      return;
    }
    this.getCart().subscribe({
      next: (cart) => {
        const count = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        this.cartCountSubject.next(count);
      },
      error: () => {
        this.cartCountSubject.next(0);
      }
    });
  }

  // Method to add a product to the cart
  addToCart(productId: string, quantity: number): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/cart/add`, { productId, quantity }, { headers }).pipe(
      tap(() => this.updateCartCount())
    );
  }

  // Method to get the user's cart
  getCart(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/cart`, { headers });
  }

  // Method to update the quantity of a product in the cart
  updateQuantity(productId: string, quantity: number): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/cart/update`, { productId, quantity }, { headers }).pipe(
      tap(() => this.updateCartCount())
    );
  }

  // Method to remove a product from the cart
  removeItem(productId: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/cart/remove/${productId}`, { headers }).pipe(
      tap(() => this.updateCartCount())
    );
  }

  // Method to clear the cart
  clearCart(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/cart/clear`, { headers }).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }
}