import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

export interface SellerApplication {
  _id?: string;
  userId?: string;
  storeName: string;
  businessName: string;
  phone: string;
  gstNumber: string;
  pickupAddress: string;
  storeLogo?: string;
  verificationDocuments?: string[];
  status?: string;
  rejectionReason?: string;
  adminRemark?: string;
  documents?: any;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Submit Application
  applyToBeSeller(data: FormData): Observable<any> {
    // Note: Do not set 'Content-Type': 'application/json' when sending FormData.
    // HttpClient handles it automatically.
    return this.http.post(`${this.apiUrl}/seller/apply`, data, { headers: this.getHeaders() });
  }

  // Get Application Status
  getApplicationStatus(): Observable<SellerApplication> {
    return this.http.get<SellerApplication>(`${this.apiUrl}/seller/application-status`, { headers: this.getHeaders() });
  }

  // Update Application
  updateApplication(data: Partial<SellerApplication>): Observable<any> {
    return this.http.put(`${this.apiUrl}/seller/update-application`, data, { headers: this.getHeaders() });
  }

  // Get Analytics
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/seller/analytics`, { headers: this.getHeaders() });
  }
}
