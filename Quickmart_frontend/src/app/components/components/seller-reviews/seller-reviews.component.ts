import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-reviews.component.html',
  styleUrls: ['./seller-reviews.component.css']
})
export class SellerReviewsComponent implements OnInit {
  reviews: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  replyingToId: string | null = null;
  replyText: string = '';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchReviews();
  }

  fetchReviews() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>(`${environment.apiUrl}/reviews/seller`, { headers }).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Failed to load reviews.";
        this.isLoading = false;
      }
    });
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
  
  getEmptyRatingArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  startReply(reviewId: string) {
    this.replyingToId = reviewId;
    this.replyText = '';
  }

  cancelReply() {
    this.replyingToId = null;
    this.replyText = '';
  }

  submitReply(reviewId: string) {
    if (!this.replyText.trim()) return;

    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.put(`${environment.apiUrl}/reviews/seller/reply/${reviewId}`, { reply: this.replyText }, { headers }).subscribe({
      next: (res: any) => {
        this.snackBar.open('Reply posted successfully', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
        const reviewIndex = this.reviews.findIndex(r => r._id === reviewId);
        if (reviewIndex !== -1) {
          this.reviews[reviewIndex].sellerReply = this.replyText;
        }
        this.replyingToId = null;
      },
      error: (err) => {
        this.snackBar.open('Failed to post reply', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
      }
    });
  }
}
