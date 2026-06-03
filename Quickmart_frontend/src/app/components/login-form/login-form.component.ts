import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-login-form',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgClass, NgIf],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  loading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    const roles = this.authService.getUserRoles();
    if (roles && roles.length > 0 && this.authService.getAccessToken()) {
      // User is already logged in, redirect them
      if (roles.includes('admin')) {
        this.router.navigate(['/admin-dashboard']);
      } else if (roles.includes('seller')) {
        this.router.navigate(['/sheller-dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    const credentials = {
      usernameOrEmail: this.loginForm.value.usernameOrEmail,
      password: this.loginForm.value.password,
    };

    this.authService
      .login(credentials)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        () => {
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        (error) => {
          this.snackBar.open(error.message, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
  }
}