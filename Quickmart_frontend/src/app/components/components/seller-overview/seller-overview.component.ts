import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { SellerService } from '../../../Services/seller.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-seller-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-overview.component.html',
  styleUrls: ['./seller-overview.component.css']
})
export class SellerOverviewComponent implements OnInit {
  analytics: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  chartInstance: any = null;

  @ViewChild('revenueChart') revenueChartRef!: ElementRef;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    this.sellerService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
        // Small timeout to allow ViewChild to bind after *ngIf removes isLoading
        setTimeout(() => this.renderChart(), 0);
      },
      error: (err) => {
        this.errorMessage = "Failed to load analytics data.";
        this.isLoading = false;
      }
    });
  }

  renderChart() {
    if (!this.revenueChartRef || !this.analytics?.monthlyRevenue) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    
    // Destroy existing chart if it exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get current month to highlight it
    const currentMonth = new Date().getMonth();

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Revenue ($)',
          data: this.analytics.monthlyRevenue,
          backgroundColor: months.map((_, i) => i === currentMonth ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.2)'),
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(34, 197, 94, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 14 },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }
}
