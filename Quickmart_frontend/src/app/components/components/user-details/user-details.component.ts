import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { OrderService } from '../../../Services/Order/order.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userId: string = '';
  user: any = null;
  orders: any[] = [];
  loginHistory: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true; // Added loading state

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchDataParallel();
  }

  fetchDataParallel(): void {
    this.isLoading = true;
    
    // Load all data simultaneously
    forkJoin({
      user: this.authService.getUserById(this.userId),
      ordersData: this.orderService.getOrdersByUserId(this.userId),
      history: this.authService.getLoginHistory(this.userId)
    }).subscribe({
      next: (results) => {
        this.user = results.user;
        this.orders = results.ordersData.orders || [];
        this.loginHistory = results.history;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || "Failed to load user details.";
        this.isLoading = false;
      }
    });
  }
}