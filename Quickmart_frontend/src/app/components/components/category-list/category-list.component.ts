// src/app/category-list/category-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CategoriesService, Category } from '../../../Services/Categories/categories.service';
import { AuthService } from '../../../Services/auth.service'; // Import AuthService
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-list',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
})
export class CategoryListComponent implements OnInit {
  Math = Math;
  categories: Category[] = [];
  isLoading: boolean = true;

  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private categoriesService: CategoriesService,
    public authService: AuthService, // Inject AuthService
    private router: Router
  ) {}

  get filteredCategories() {
    if (!this.searchQuery) return this.categories;
    const query = this.searchQuery.toLowerCase();
    return this.categories.filter(c => 
      c.name?.toLowerCase().includes(query) || 
      c.description?.toLowerCase().includes(query)
    );
  }

  get paginatedCategories() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredCategories.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoriesService.getAllCategories().subscribe(
      (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    );
  }

  deleteCategory(id: string): void {
    if (!this.authService.getUserRoles().includes('admin')) {
      alert('You do not have permission to delete categories.');
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      this.categoriesService.deleteCategory(id).subscribe(
        () => {
          // Remove the deleted category from the list
          this.categories = this.categories.filter(category => category.id !== id);
        },
        (error) => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }

  editCategory(id: string): void {
    this.router.navigate(['/admin-dashboard/add-category', id]);
  }
}