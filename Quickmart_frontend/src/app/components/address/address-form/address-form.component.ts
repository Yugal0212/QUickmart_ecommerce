import Swal from 'sweetalert2';
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from '../../../Services/adresses/adress.service';

@Component({
  selector: 'app-address-form',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css']
})
export class AddressFormComponent implements OnInit {
  addressForm: FormGroup;
  isEditMode: boolean = false; // Track edit mode
  addressId: string | null = null; // Store the address ID for edit mode

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private addressService: AddressService
  ) {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      landmark: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.addressId = params.get('id'); // Get the address ID from the route
      if (this.addressId) {
        this.isEditMode = true; // Enable edit mode
        this.loadAddressForEdit(this.addressId); // Load address data for editing
      }
    });
  }

  // Load address data for editing
  loadAddressForEdit(addressId: string): void {
    this.addressService.getAddressById(addressId).subscribe(
      (address) => {
        this.addressForm.patchValue({
          fullName: address.fullName,
          phoneNumber: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          country: address.country,
          state: address.state,
          zipCode: address.zipCode,
          landmark: address.landmark
        });
      },
      (error) => {
        console.error('Error loading address:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      const addressData = {
        fullName: this.addressForm.value.fullName,
        phone: this.addressForm.value.phoneNumber, // Map phoneNumber to phone
        addressLine1: this.addressForm.value.addressLine1,
        addressLine2: this.addressForm.value.addressLine2,
        city: this.addressForm.value.city,
        country: this.addressForm.value.country,
        state: this.addressForm.value.state,
        zipCode: this.addressForm.value.zipCode,
        landmark: this.addressForm.value.landmark
      };
  
      console.log("Sending address data to backend:", addressData); // Debugging
  
      if (this.isEditMode && this.addressId) {
        // Update existing address
        this.addressService.updateAddress(this.addressId, addressData).subscribe(
          (response) => {
            console.log("Address updated successfully:", response);
            Swal.fire({ text: "✅ Address updated successfully!", confirmButtonColor: '#255ff4' });
            this.router.navigate(['/order/address']);
          },
          (error) => {
            console.error("Error updating address:", error);
            Swal.fire({ text: "❌ Failed to update address. Please try again.", confirmButtonColor: '#255ff4' });
          }
        );
      } else {
        // Add new address
        this.addressService.addAddress(addressData).subscribe(
          (response) => {
            console.log("Address saved successfully:", response);
            Swal.fire({ text: "✅ Address saved successfully!", confirmButtonColor: '#255ff4' });
            this.router.navigate(['/order/address']);
          },
          (error) => {
            console.error("Error saving address:", error);
            Swal.fire({ text: "❌ Failed to save address. Please try again.", confirmButtonColor: '#255ff4' });
          }
        );
      }
    }
  }
}