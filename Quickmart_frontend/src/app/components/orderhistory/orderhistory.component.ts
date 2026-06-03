import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../Services/Order/order.service';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-order-history',
  imports:[CommonModule,NgClass],
  templateUrl: './orderhistory.component.html',
  styleUrls: ['./orderhistory.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // Fetch User Orders
  fetchOrders(): void {
    this.orderService.getMyOrders().subscribe(
      (response) => {
        this.orders = response.orders;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching orders:', error);
        this.isLoading = false;
      }
    );
  }

  // Cancel Order
  cancelOrder(orderId: string): void {
    this.orderService.cancelOrder(orderId).subscribe(
      (response) => {
        alert('Order cancelled successfully');
        this.fetchOrders(); // Refresh the order list
      },
      (error) => {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    );
  }
}