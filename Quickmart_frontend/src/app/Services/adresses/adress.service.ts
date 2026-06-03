import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = environment.apiUrl; // Base API URL from environment.ts

  constructor(private http: HttpClient) {}

  // Get all addresses for the logged-in user
  getAllAddresses(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
    return this.http.get(`${this.apiUrl}/address`, { headers });
  }

  // Get a specific address by ID
  getAddressById(addressId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
    return this.http.get(`${this.apiUrl}/address/${addressId}`, { headers });
  }

  // Add a new address
  addAddress(addressData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  
    // Log the request payload for debugging
    console.log("Sending address data to backend:", addressData);
  
    return this.http.post(`${this.apiUrl}/address/add`, addressData, { headers });
  }

  // Update an existing address
  updateAddress(addressId: string, addressData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
    return this.http.put(`${this.apiUrl}/address/${addressId}`, addressData, { headers });
  }

  // Delete an address
  deleteAddress(addressId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
    return this.http.delete(`${this.apiUrl}/address/${addressId}`, { headers });
  }
}