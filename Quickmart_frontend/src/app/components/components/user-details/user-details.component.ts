import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { OrderService } from '../../../Services/Order/order.service';
import { CommonModule } from '@angular/common';

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
    this.fetchUserDetails();
    this.fetchUserOrders();
    this.fetchLoginHistory();
  }

  fetchUserDetails(): void {
    this.authService.getUserById(this.userId).subscribe(
      (response) => {
        this.user = response;
        this.isLoading = false; // Stop loading
      },
      (error) => {
        this.errorMessage = error.message;
        this.isLoading = false; // Stop loading
      }
    );
  }

  fetchUserOrders(): void {
    this.orderService.getOrdersByUserId(this.userId).subscribe(
      (response) => {
        this.orders = response.orders;
        this.isLoading = false; // Stop loading
      },
      (error) => {
        this.errorMessage = error.message;
        this.isLoading = false; // Stop loading
      }
    );
  }

  fetchLoginHistory(): void {
    this.authService.getLoginHistory(this.userId).subscribe(
      (response) => {
        this.loginHistory = response;
        this.isLoading = false; // Stop loading
      },
      (error) => {
        this.errorMessage = error.message;
        this.isLoading = false; // Stop loading
      }
    );
  }
}