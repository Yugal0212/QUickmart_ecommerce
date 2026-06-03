import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css']
})
export class AdminOverviewComponent implements OnInit, AfterViewInit {
  analytics: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  chart: any;

  @ViewChild('revenueChart') revenueChartRef!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  ngAfterViewInit(): void {
    // Chart will initialize after data fetch
  }

  fetchAnalytics() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.errorMessage = "Not authenticated";
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${environment.apiUrl}/admin/analytics`, { headers }).subscribe({
      next: (data: any) => {
        this.analytics = data;
        this.isLoading = false;
        setTimeout(() => this.initChart(), 0);
      },
      error: (err) => {
        this.errorMessage = "Failed to load analytics.";
        this.isLoading = false;
      }
    });
  }

  initChart() {
    if (!this.revenueChartRef || !this.analytics) return;
    
    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    
    // Gradient for line chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); // green-500
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Platform Revenue ($)',
          data: this.analytics.monthlyRevenue || Array(12).fill(0),
          borderColor: '#22c55e',
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#22c55e',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 14, weight: 'bold' },
            callbacks: {
              label: function(context: any) {
                return '$' + (context.parsed.y || 0).toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6',
            },
            border: { dash: [4, 4] },
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}
