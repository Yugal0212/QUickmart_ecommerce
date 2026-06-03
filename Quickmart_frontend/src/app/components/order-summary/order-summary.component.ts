import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../Services/Cart/cart.service';
import { OrderService } from '../../Services/Order/order.service';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-order-summary',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent {
  selectedAddress: any = null;
  cart: any = { items: [], total: 0 };
  isLoading = true;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.loadSelectedAddress();
    this.loadCart();
  }

  // Load Selected Address from localStorage
  loadSelectedAddress(): void {
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      this.selectedAddress = JSON.parse(savedAddress);
    }
  }

  // Load Cart Details
  loadCart(): void {
    this.cartService.getCart().subscribe(
      (response) => {
        this.cart = response;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
      }
    );
  }

  // Calculate Total (Subtotal + Shipping Charges)
  // Calculate Total (Sum of all item total prices)
getTotal(): number {
  return this.cart.items.reduce((total: any, item: { totalPrice: any; }) => total + item.totalPrice, 0);
}

  // Place Order
  placeOrder(): void {
    const orderSummary = {
      items: this.cart.items,
      totalAmount: this.getTotal(),
      shippingAddress: this.selectedAddress
    };
    this.router.navigate(['/order/order-payment'], { state: { orderSummary } });
  }
}