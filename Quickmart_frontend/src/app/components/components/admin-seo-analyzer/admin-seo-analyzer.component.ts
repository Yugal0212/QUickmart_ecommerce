import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoApiService } from '../../../Services/seo-api.service';

@Component({
  selector: 'app-admin-seo-analyzer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-seo-analyzer.component.html',
  styleUrls: ['./admin-seo-analyzer.component.css']
})                                                                  
export class AdminSeoAnalyzerComponent implements OnInit {
  analysis: any = null;
  isLoading = true;
  errorMessage = '';

  constructor(private seoApi: SeoApiService) {}

  ngOnInit() {
    this.seoApi.getSeoAnalysis().subscribe({
      next: (data) => {
        this.analysis = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to run SEO Analysis';
        this.isLoading = false;
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  }
}
