import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  clearCart() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Place Order
  placeOrder(orderPayload: any, shippingAddress: any): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/order/place`, { ...orderPayload, shippingAddress }, { headers });
  }

  // Get User Orders
  getMyOrders(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/order/my-orders`, { headers });
  }

  // Get Order by ID
  getOrderById(orderId: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/order/${orderId}`, { headers });
  }

  // Cancel Order
  cancelOrder(orderId: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/order/cancel/${orderId}`, {}, { headers });
  }


  // Get Orders by User ID
// Get Orders by User ID
getOrdersByUserId(userId: string): Observable<any> {
  const token = localStorage.getItem('accessToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.apiUrl}/order/user/${userId}`, { headers });
}
}