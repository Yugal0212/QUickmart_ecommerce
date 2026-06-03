import { Component, OnInit } from '@angular/core';
import { SellerService, SellerApplication } from '../../Services/seller.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { PreloaderComponent } from '../preloader/preloader.component';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var AOS: any;

@Component({
  selector: 'app-become-seller',
  imports: [FormsModule, PreloaderComponent, NgIf],
  templateUrl: './become-seller.component.html',
  styleUrls: ['./become-seller.component.css']
})
export class BecomeSellerComponent implements OnInit {
  showPreloader: boolean = false;

  sellerDetails: Partial<SellerApplication> = {
    storeName: '',
    businessName: '',
    phone: '',
    gstNumber: '',
    pickupAddress: ''
  };

  currentReviewIndex = 0;
  reviews = [
    {
      text: "Selling on QuickMart has boosted my business by 300%! The platform is easy to use, and the support team is amazing.",
      author: "John Doe"
    },
    {
      text: "The payment system is seamless and hassle-free! I highly recommend QuickMart to all sellers.",
      author: "Emma Smith"
    },
    {
      text: "QuickMart helped me reach a wider audience. My sales have never been better!",
      author: "Michael Johnson"
    }
  ];

  constructor(private sellerService: SellerService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    AOS.init(); // Initialize AOS animations
    this.showReview(this.currentReviewIndex);
    
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

  onSubmit() {
    this.showPreloader = true;
    
    this.sellerService.applyToBeSeller(this.sellerDetails).subscribe(
      (response) => {
        setTimeout(() => {
          this.showPreloader = false;
          this.snackBar.open('Application submitted successfully!', 'Close', { duration: 5000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/seller-application-status']);
        }, 1500);
      },
      (error) => {
        this.showPreloader = false;
        this.snackBar.open(error.error?.message || 'Failed to submit application.', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    );
  }

  showReview(index: number) {
    const reviews = document.querySelectorAll('.review-item');
    reviews.forEach((review, i) => {
      if (i === index) {
        review.classList.add('active');
      } else {
        review.classList.remove('active');
      }
    });
  }

  nextReview() {
    this.currentReviewIndex = (this.currentReviewIndex + 1) % this.reviews.length;
    this.showReview(this.currentReviewIndex);
  }

  prevReview() {
    this.currentReviewIndex = (this.currentReviewIndex - 1 + this.reviews.length) % this.reviews.length;
    this.showReview(this.currentReviewIndex);
  }
}