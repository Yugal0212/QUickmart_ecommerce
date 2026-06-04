// user-manage.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-manage.component.html',
  styleUrl: './user-manage.component.css'
})
export class UserManageComponent {
  Math = Math;
  users: any[] = []; // Array to store the list of users
  errorMessage: string = ''; // Variable to store error messages
  isLoading: boolean = true; 
  
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private authService: AuthService, private router: Router) {}

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    const query = this.searchQuery.toLowerCase();
    return this.users.filter(u => 
      u.username?.toLowerCase().includes(query) || 
      u.email?.toLowerCase().includes(query) ||
      u._id?.toLowerCase().includes(query)
    );
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
  }

  // KPIs
  get totalUsersCount() { return this.users.length; }
  get activeUsersCount() { return this.users.filter(u => u.isActive !== false && u.status !== 'blocked').length; }
  get blockedUsersCount() { return this.users.filter(u => u.isActive === false || u.status === 'blocked').length; }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

 
  ngOnInit(): void {
    this.fetchAllUsers();
  }

  fetchAllUsers(): void {
    this.isLoading = true; // Start loading
    this.authService.getAllUsers().subscribe(
      (response) => {
        this.users = response;
        this.isLoading = false; // Stop loading
      },
      (error) => {
        this.errorMessage = error.message;
        this.isLoading = false; // Stop loading
      }
    );
  }
  viewUserDetails(userId: string): void {
    this.router.navigate([`/admin-dashboard/user-details/${userId}`]);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe(
        (response) => {
          this.fetchAllUsers(); // Refresh the user list after deletion
        },
        (error) => {
          this.errorMessage = error.message; // Display error message if the API call fails
        }
      );
    }
  }

  toggleBlockUser(user: any): void {
    const action = user.isActive === false ? 'unblock' : 'block';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      const apiCall = action === 'block' 
        ? this.authService.blockUser(user._id)
        : this.authService.unblockUser(user._id);

      apiCall.subscribe({
        next: () => {
          this.fetchAllUsers();
        },
        error: (err) => {
          this.errorMessage = err;
        }
      });
    }
  }
}