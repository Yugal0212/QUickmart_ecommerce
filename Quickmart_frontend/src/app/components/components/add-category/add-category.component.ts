import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesService } from '../../../Services/Categories/categories.service';
import { AuthService } from '../../../Services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { PreloaderComponent } from '../../preloader/preloader.component';

@Component({
  selector: 'app-add-category',
  imports: [FormsModule,ReactiveFormsModule,NgIf,PreloaderComponent],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  selectedFile: File | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  categoryId: string | null = null;
  existingImage: string | null = null; // To store the existing image URL
  showPreloader: boolean = false; // Add a flag to control the preloader visibility


  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      image: [null], // Remove required validator for edit mode
    });
  }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategoryForEdit(this.categoryId);
    }
  }

  loadCategoryForEdit(id: string): void {
    this.isLoading = true;
    this.categoriesService.getCategoryById(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description,
        });
        // Set the existing image URL
        this.existingImage = category.image;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.isLoading = false;
      },
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.categoryForm.patchValue({
        image: this.selectedFile,
      });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('description', this.categoryForm.get('description')?.value);

    // Append the new image only if selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.isEditMode && this.existingImage) {
      // Retain the existing image if no new file is selected
      formData.append('image', this.existingImage);
    }

    if (this.isEditMode && this.categoryId) {
      // Update Category
      this.showPreloader = true; // Hide the preload
      this.categoriesService.updateCategory(this.categoryId, formData).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.showPreloader = false; // Hide the preloader
            this.router.navigate(['/admin-dashboard/categories']); // Redirect to the cart page
          }, 2000); 
          
         
        },
        error: (error) => {
          this.showPreloader = false; // Hide the preloader
          console.error('Error updating category:', error);
          Swal.fire({ text: 'Failed to update category. Please try again.', confirmButtonColor: '#255ff4' });
          this.isLoading = false;
        },
      });
    } else {
      // Add Category
      this.showPreloader = true; // Hide the preload
      this.categoriesService.createCategory(formData).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.showPreloader = false; // Hide the preloader
            this.router.navigate(['/admin-dashboard/categories']); // Redirect to the cart page
          }, 2000); 
          // Swal.fire({ text: 'Category added successfully!', confirmButtonColor: '#255ff4' });
        },
        error: (error) => {
          this.showPreloader = false; // Hide the preloader
          console.error('Error adding category:', error);
          Swal.fire({ text: 'Failed to add category. Please try again.', confirmButtonColor: '#255ff4' });
          this.isLoading = false;
        },
      });
    }
  }
}