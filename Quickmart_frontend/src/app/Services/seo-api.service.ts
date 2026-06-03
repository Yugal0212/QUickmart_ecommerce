import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeoApiService {
  private apiUrl = `${environment.apiUrl}/seo`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, data, { headers: this.getAuthHeaders() });
  }

  getSeoAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analyze`, { headers: this.getAuthHeaders() });
  }
}
