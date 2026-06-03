import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoApiService } from '../../../Services/seo-api.service';

@Component({
  selector: 'app-admin-seo-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-seo-settings.component.html',
  styleUrls: ['./admin-seo-settings.component.css']
})
export class AdminSeoSettingsComponent implements OnInit {
  settings: any = {
    title: '',
    description: '',
    keywords: '',
    author: '',
    language: 'en',
    canonicalUrl: '',
    googleSearchConsoleId: '',
    googleAnalyticsId: ''
  };
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private seoApi: SeoApiService) {}

  ngOnInit() {
    this.seoApi.getSettings().subscribe({
      next: (data) => {
        this.settings = data || this.settings;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load SEO settings';
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.seoApi.updateSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.successMessage = 'SEO Settings saved successfully!';
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to save SEO settings';
        this.isSaving = false;
      }
    });
  }
}
