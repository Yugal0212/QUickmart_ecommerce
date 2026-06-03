// src/app/services/categories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { Product } from '../product/products.service';
import { AuthService } from '../auth.service';

export interface Category {
  id: string;
  _id: string; 
  name: string;
  image: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  
  private apiUrl = `${environment.apiUrl}/categories`;
  

  constructor(private http: HttpClient,
    private authService: AuthService 
  ) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      map(categories => categories.map(category => ({
        ...category,
        id: category._id
      }))
    ));

  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      map(category => ({
        ...category,
        id: category._id // Map _id to id
      }))
    );
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/${categoryId}/products`);
  }


  // src/app/services/categories.service.ts
  deleteCategory(id: string): Observable<void> {
    const token = this.authService.getAccessToken(); // Get the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Add the token to the headers
    });

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }


  

  createCategory(formData: FormData): Observable<Category> {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.post<Category>(`${this.apiUrl}`, formData, { headers });
  }

  updateCategory(id: string, formData: FormData): Observable<Category> {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put<Category>(`${this.apiUrl}/${id}`, formData, { headers });
  }
  
}