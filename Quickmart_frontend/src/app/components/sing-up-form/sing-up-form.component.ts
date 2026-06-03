import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PreloaderComponent } from "../preloader/preloader.component";

@Component({
  selector: 'app-sing-up-form',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgClass, NgIf, PreloaderComponent],  // Correct imports
  templateUrl: './sing-up-form.component.html',
  styleUrls: ['./sing-up-form.component.css']
})
export class SingUpFormComponent {
  signupForm: FormGroup;
  showPassword = false;
  showPreloader: boolean = false; // Add a flag to control the preloader visibility


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue],
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }
    this.showPreloader = true; // Hide the preloader

    this.authService.register(this.signupForm.value).subscribe(
      (response) => {
        // Show success message
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
        setTimeout(() => {
          this.showPreloader = false; // Hide the preloader
          this.router.navigate(['/login']); // Redirect to the cart page
        }, 2000); 
        
      },
      (error) => {
        // Show error message
        this.showPreloader = false; // Hide the preloader

        this.snackBar.open(error.message || 'You are already register', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      }
    );
  }
}