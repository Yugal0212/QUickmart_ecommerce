import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'; // Import ConfirmationDialogComponent
import { AddressService } from '../../Services/adresses/adress.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-address',
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent {
  addresses: any[] = [];
  selectedAddress: any = null;
  isLoading: boolean = true;
  showError: boolean = false;

  constructor(
    private addressService: AddressService,
    private router: Router, // Inject Router
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.isLoading = true; // Start loading
    this.addressService.getAllAddresses().subscribe(
      (data) => {
        this.addresses = data;
        this.isLoading = false; // Stop loading
      },
      (error) => {
        console.error('Error fetching addresses', error);
        this.isLoading = false; // Stop loading even if there's an error
      }
    );
  }

  deleteAddress(addressId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this address?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addressService.deleteAddress(addressId).subscribe(
          (response) => {
            console.log('Address deleted successfully:', response);
            this.loadAddresses(); // Reload addresses after deletion
          },
          (error) => {
            console.error('Error deleting address:', error);
            Swal.fire({ text: 'Failed to delete address. Please try again.', confirmButtonColor: '#255ff4' });
          }
        );
      }
    });
  }

  editAddress(addressId: string): void {
    this.router.navigate(['/order/Add-address', addressId]); // Navigate to edit mode with address ID
  }

  onAddressSelect(address: any): void {
    this.selectedAddress = address; // Update the selected address
    this.showError = false; // Hide error message when an address is selected
  }

  onDeliverClick(): void {
    if (!this.selectedAddress) {
      this.showError = true; // Show error message if no address is selected
    } else {
      // Save the selected address to localStorage
      localStorage.setItem('selectedAddress', JSON.stringify(this.selectedAddress));

      // Navigate to the order summary page using an absolute path
      console.log('Navigating to order summary page');
      this.router.navigate(['/order/order-summary']);
    }
  }
}