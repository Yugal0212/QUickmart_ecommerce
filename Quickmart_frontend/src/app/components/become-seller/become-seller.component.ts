import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../Services/seller.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { PreloaderComponent } from '../preloader/preloader.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-become-seller',
  standalone: true,
  imports: [FormsModule, PreloaderComponent, NgIf, CommonModule],
  templateUrl: './become-seller.component.html',
  styleUrls: ['./become-seller.component.css']
})
export class BecomeSellerComponent implements OnInit {
  showPreloader: boolean = false;
  currentStep = 1;

  formData = {
    fullName: '',
    email: '',
    mobile: '',
    storeName: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  };

  files: any = {
    aadhaarCard: null,
    panCard: null,
    gstCertificate: null,
    businessLicense: null
  };

  constructor(private sellerService: SellerService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Check if user already applied
    this.sellerService.getApplicationStatus().subscribe({
      next: (app) => {
        if (app && app.status !== 'rejected') {
          this.router.navigate(['/seller-application-status']);
        }
      },
      error: () => {} // Ignore 404
    });
  }

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onFileChange(event: any, field: string) {
    if (event.target.files.length > 0) {
      this.files[field] = event.target.files[0];
    }
  }

  onSubmit() {
    this.showPreloader = true;
    const submitData = new FormData();
    
    // Append text fields
    for (const key in this.formData) {
      if (this.formData.hasOwnProperty(key)) {
        submitData.append(key, (this.formData as any)[key]);
      }
    }
    
    // Append files
    if (this.files.aadhaarCard) submitData.append('aadhaarCard', this.files.aadhaarCard);
    if (this.files.panCard) submitData.append('panCard', this.files.panCard);
    if (this.files.gstCertificate) submitData.append('gstCertificate', this.files.gstCertificate);
    if (this.files.businessLicense) submitData.append('businessLicense', this.files.businessLicense);

    this.sellerService.applyToBeSeller(submitData).subscribe({
      next: (response) => {
        this.showPreloader = false;
        this.snackBar.open('Application submitted successfully! You will receive an email shortly.', 'Close', { duration: 5000, panelClass: ['success-snackbar'] });
        this.router.navigate(['/seller-application-status']);
      },
      error: (error) => {
        this.showPreloader = false;
        this.snackBar.open(error.error?.message || 'Failed to submit application.', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
}