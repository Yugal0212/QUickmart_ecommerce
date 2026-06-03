import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../Services/Order/order.service';
import { CartService } from '../../Services/Cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PreloaderComponent } from '../preloader/preloader.component';

declare const bootstrap: any;

@Component({
  selector: 'app-payment',
  imports: [NgFor, NgIf, PreloaderComponent, CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @ViewChild('payToast') payToastEl?: ElementRef;

  orderSummary: any;
  isLoading: boolean = false; // Flag to control preloader visibility

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Retrieve order summary data from navigation state
    this.orderSummary = history.state.orderSummary;

    // If no data is passed, redirect back to the order summary page
    if (!this.orderSummary) {
      this.router.navigate(['/order/order-summary']);
    }
  }

  // Handle "Confirm & Pay" button click
  confirmAndPay(): void {
    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to confirm and pay for this order?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // User confirmed, show preloader
        this.isLoading = true;

        // Prepare order payload
        const orderPayload = {
          items: this.orderSummary.items,
          totalAmount: this.orderSummary.totalAmount,
          shippingAddress: this.orderSummary.shippingAddress,
          paymentMethod: 'COD'
        };

        // Place the order instantly (No artificial simulated delay!)
        this.orderService.placeOrder(orderPayload, this.orderSummary.shippingAddress).subscribe({
          next: (response) => {
            // Order placed successfully, clear the cart
            this.cartService.clearCart().subscribe({
              next: () => {
                console.log('Cart cleared successfully.');
                this.isLoading = false; // Hide preloader
                this.router.navigate(['/order/complete']); // Redirect to order confirmation page
              },
              error: (error) => {
                console.error('Error clearing cart:', error);
                this.isLoading = false; // Hide preloader
                this.showToast('⚠️ Order placed, but there was an issue clearing your cart.', 'error');
                setTimeout(() => {
                  this.router.navigate(['/order/complete']);
                }, 2000);
              }
            });
          },
          error: (error) => {
            console.error('Error placing order:', error);
            this.isLoading = false; // Hide preloader
            const errorMsg = error?.error?.message || error?.message || 'Failed to place order.';
            this.showToast(`❌ ${errorMsg}`, 'error');
          }
        });
      } else {
        // User canceled the confirmation
        console.log('Payment and order placement canceled.');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.payToastEl) {
      try {
        const toastEl = new bootstrap.Toast(this.payToastEl.nativeElement, { delay: 3000 });
        toastEl.show();
      } catch (e) {
        console.warn('Toast display failed:', e);
      }
    }
  }

  hideToast(): void {
    if (this.payToastEl) {
      try {
        const toastEl = bootstrap.Toast.getInstance(this.payToastEl.nativeElement);
        if (toastEl) toastEl.hide();
      } catch (e) {}
    }
  }
}