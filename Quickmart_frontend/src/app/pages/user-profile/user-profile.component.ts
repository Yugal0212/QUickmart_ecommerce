import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { OrderService } from '../../Services/Order/order.service';
import { AddressService } from '../../Services/adresses/adress.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userId: string | null = null;
  username: string | null = null;
  email: string | null = null;
  roles: string[] = [];
  avatar: string | null = null;
  
  orders: any[] = [];
  addresses: any[] = [];
  
  isEditingProfile = false;
  isAddingAddress = false;
  isSubmitting = false;

  editProfileData = { username: '', email: '' };
  avatarFile: File | null = null;
  avatarPreview: string | ArrayBuffer | null = null;

  newAddress = {
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  };
  
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    this.username = localStorage.getItem('username');
    this.email = localStorage.getItem('email');
    this.avatar = localStorage.getItem('avatar');
    this.roles = this.authService.getUserRoles();

    this.authService.profileUpdated.subscribe(() => {
      this.username = localStorage.getItem('username');
      this.email = localStorage.getItem('email');
      this.avatar = localStorage.getItem('avatar');
    });

    if (!this.userId) {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;

    forkJoin({
      ordersRes: this.orderService.getMyOrders().pipe(catchError(err => of({ orders: [] }))),
      addressesRes: this.addressService.getAllAddresses().pipe(catchError(err => of([])))
    }).subscribe({
      next: (results) => {
        this.orders = results.ordersRes.orders || results.ordersRes || [];
        this.addresses = results.addressesRes || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile data.';
        this.isLoading = false;
      }
    });
  }

  // --- Profile Editing ---
  openEditProfile() {
    this.isEditingProfile = true;
    this.editProfileData = { username: this.username || '', email: this.email || '' };
    this.avatarPreview = this.avatar;
    this.avatarFile = null;
  }

  cancelEditProfile() {
    this.isEditingProfile = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.avatarPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('username', this.editProfileData.username);
    formData.append('email', this.editProfileData.email);
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isEditingProfile = false;
        Swal.fire('Success', 'Profile updated successfully!', 'success');
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Error', err || 'Failed to update profile', 'error');
      }
    });
  }

  // --- Address Management ---
  openAddAddress() {
    this.isAddingAddress = true;
    this.newAddress = {
      fullName: '', phoneNumber: '', addressLine1: '', addressLine2: '',
      city: '', state: '', zipCode: '', country: '', isDefault: false
    };
  }

  cancelAddAddress() {
    this.isAddingAddress = false;
  }

  saveAddress() {
    this.isSubmitting = true;
    this.addressService.addAddress(this.newAddress).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isAddingAddress = false;
        this.addresses.push(res.address);
        Swal.fire('Success', 'Address added successfully!', 'success');
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Error', 'Failed to add address', 'error');
      }
    });
  }
}
