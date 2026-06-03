import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-ai-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ai-insights.component.html'
})
export class AdminAiInsightsComponent implements OnInit {
  isAnalyzing: boolean = false;
  lastUpdated = new Date();
  insights: any[] = [];
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.runDeepScan();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }
  runDeepScan() {
    this.isAnalyzing = true;
    this.http.get<any>(`${this.apiUrl}/admin/ai-insights`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => {
          this.isAnalyzing = false;
          this.lastUpdated = new Date();
          this.insights = data.insights;
        },
        error: (err) => {
          this.isAnalyzing = false;
          console.error('Failed to run AI scan', err);
        }
      });
  }
}
