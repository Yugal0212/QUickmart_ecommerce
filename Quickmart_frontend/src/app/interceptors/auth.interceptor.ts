import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // If we get a 401 Unauthorized response from the backend (JWT expired/invalid)
      if (error.status === 401) {
        // Log out the user and redirect to login
        authService.logout().subscribe({
          error: () => {
            // Even if logout API fails, force redirect to login
            localStorage.clear();
            router.navigate(['/login']);
          }
        });
      }
      return throwError(() => error);
    })
  );
};
