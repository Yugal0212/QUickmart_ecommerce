import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../Services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../Services/product/products.service';
import { CategoriesService } from '../../../Services/Categories/categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PreloaderComponent } from '../../preloader/preloader.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-product',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: any[] = []; // List of categories
  uploadedImages: string[] = []; // Array to store base64 images for preview
  selectedFiles: File[] = []; // Array to store selected files
  isEditMode = false; // Flag to check if in edit mode
  productId: string | null = null; // Product ID for edit mode
  showPreloader: boolean = false; // Add a flag to control the preloader visibility


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoriesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialize the form
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      images: [[]],
    });
  }

  ngOnInit(): void {
    this.loadCategories(); 

    // Check if in edit mode
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProductForEdit(this.productId); 
    }
  }

  // Load categories for the dropdown
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (categories: any[]) => {
        this.categories = categories;
      },
      (error: any) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  // Load product data for editing
  loadProductForEdit(productId: string): void {
    this.productService.getProductById(productId).subscribe(
      (product: any) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          category: product.category?._id || product.category?.id || product.category,
        });
        this.uploadedImages = product.images; // Pre-fill images
      },
      (error: any) => {
        console.error('Error loading product for edit:', error);
      }
    );
  }

  // Handle file selection
  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files); // Convert FileList to array
      this.uploadedImages = []; // Clear previous previews

      // Read files and display previews
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fill out all required fields correctly.', 'Close', { duration: 3000 });
      return; // Stop if the form is invalid
    }

    const categoryId = this.productForm.value.category;
    // Strict check for valid 24-character MongoDB ObjectId hex format
    const isIdValid = /^[0-9a-fA-F]{24}$/.test(categoryId);
    if (!isIdValid) {
      this.snackBar.open('Invalid category format detected. Please select a valid category.', 'Close', { duration: 3000 });
      return;
    }
  
    const formData = new FormData();
  
    // Append product details to FormData
    formData.append('name', this.productForm.value.name);
    formData.append('description', this.productForm.value.description);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('stockQuantity', this.productForm.value.stockQuantity.toString());
    formData.append('category', this.productForm.value.category);
  
    // Append image files to FormData
    for (const file of this.selectedFiles) {
      formData.append('images', file, file.name); // Ensure the file name is included
    }
  
    this.showPreloader = true; // Show the preloader

    if (this.isEditMode && this.productId) {
      // Update existing product
      this.productService.updateProduct(this.productId, formData).subscribe(
        () => {
          this.showPreloader = false;
          this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
          this.router.navigate(['/sheller-dashboard']);
        },
        (error) => {
          this.showPreloader = false;
          console.error('Error updating product:', error);
          this.snackBar.open('Failed to update product. Please try again.', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
        }
      );
    } else {
      // Create new product
      this.productService.createProduct(formData).subscribe(
        () => {
          this.showPreloader = false;
          this.snackBar.open('Product created successfully!', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
          this.router.navigate(['/sheller-dashboard']);
        },
        (error) => {
          this.showPreloader = false;
          console.error('Error creating product:', error);
          this.snackBar.open('Failed to create product. Please try again.', 'Close', { duration: 3000, panelClass: ['bg-red-600', 'text-white'] });
        }
      );
    }
  }
}