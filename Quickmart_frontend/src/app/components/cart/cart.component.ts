import { Component, OnInit } from '@angular/core';
import { CartService } from '../../Services/Cart/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: any = { items: [], total: 0 };
  isLoading: boolean = true;

  constructor(
    private cartService: CartService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchCart();
  }

  fetchCart(): void {
    this.cartService.getCart().subscribe(
      (response) => {
        this.cart = response;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching cart:', error);
        this.isLoading = false;
      }
    );
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      return;
    }
    this.cartService.updateQuantity(productId, quantity).subscribe(
      (response) => {
        this.cart = response;
      },
      (error) => {
        console.error('Error updating quantity:', error);
      }
    );
  }

  confirmRemoveItem(productId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to remove this item from the cart?' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeItem(productId);
      }
    });
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId).subscribe(
      (response) => {
        this.cart = response;
      },
      (error) => {
        console.error('Error removing product:', error);
      }
    );
  }

  confirmClearCart(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to clear the entire cart?' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.clearCart();
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(
      (response) => {
        this.cart = { items: [], total: 0 };
      },
      (error) => {
        console.error('Error clearing cart:', error);
      }
    );
  }
}