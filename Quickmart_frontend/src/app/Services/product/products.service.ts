import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from '../auth.service';

export interface Product {
  rating: number;
  reviewCount: any;
  discount: any;
  _id: string; // MongoDB ID
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: { _id: string; name: string };
  seller?: { _id: string; username: string }; 
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private buildAuthHeaders(): HttpHeaders | undefined {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return undefined;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  // Create a new product
  createProduct(formData: FormData): Observable<Product> {
    const accessToken = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  
    return this.http.post<Product>(`${this.apiUrl}/products/create`, formData, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating product:', error);
        throw error;
      })
    );
  }

  // Get all products
  getAllProducts(): Observable<Product[]> {
    const headers = this.buildAuthHeaders();
    const options = headers ? { headers } : {};

    return this.http.get<Product[]>(`${this.apiUrl}/products`, options).pipe(
      catchError((error) => {
        console.error('Error fetching all products:', error);
        throw error;
      })
    );
  }

  // Get a single product by ID
  getProductById(productId: string): Observable<Product> {
    const headers = this.buildAuthHeaders();
    const options = headers ? { headers } : {};

    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`, options).pipe(
      catchError((error) => {
        console.error('Error fetching product by ID:', error);
        throw error;
      })
    );
  }

  // Delete a product
  deleteProduct(productId: string): Observable<void> {
    const accessToken = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.delete<void>(`${this.apiUrl}/products/${productId}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting product:', error);
        throw error;
      })
    );
  }

  // Update a product
  updateProduct(productId: string, productData: any): Observable<Product> {
    const accessToken = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.put<Product>(`${this.apiUrl}/products/${productId}`, productData, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating product:', error);
        throw error;
      })
    );
  }

  // Get products by seller
  getProductsBySeller(): Observable<Product[]> {
    const accessToken = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  
    return this.http.get<Product[]>(`${this.apiUrl}/products/seller`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching seller products:', error);
        throw error;
      })
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const headers = this.buildAuthHeaders();
    const options = headers ? { headers } : {};

    return this.http.get<Product[]>(`${this.apiUrl}/products/search?query=${query}`, options);
  }
}