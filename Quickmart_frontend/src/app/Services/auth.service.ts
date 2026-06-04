import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { environment } from '../environments/environments';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAdmin() {
    throw new Error('Method not implemented.');
  }
 
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken'); // Return the access token from localStorage
  }
  isPathAllowed(url: string) {
    throw new Error('Method not implemented.');
  }
  

  private tokenSubject: BehaviorSubject<string | null>;
  public token: Observable<string | null>;

  private profileUpdatedSubject = new BehaviorSubject<boolean>(true);
  public profileUpdated = this.profileUpdatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.tokenSubject = new BehaviorSubject<string | null>(
      localStorage.getItem('accessToken')
    );
    this.token = this.tokenSubject.asObservable();
  }


  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

 


  // Role-based guard logic
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.tokenValue;
    const roles = this.getUserRoles();
  
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  
    if (roles.includes('admin')) {
      if (state.url.startsWith('/admin-dashboard')) return true;
      this.router.navigate(['/admin-dashboard']);
      return false;
    } else if (roles.includes('seller')) {
      if (state.url.startsWith('/sheller-dashboard')) return true;
      this.router.navigate(['/sheller-dashboard']);
      return false;
    } else if (roles.includes('customer')) {
      if (state.url.startsWith('/home') || state.url === '/') return true;
      this.router.navigate(['/home']);
      return false;
    }
    
    this.router.navigate(['/login']);
    return false;
  }

  register(user: { username: string; email: string; password: string; terms: boolean }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, user).pipe(
      map((response: any) => {
        return response; // Return the response for successful registration
      }),
      catchError((error) => {
        // Handle specific error cases
        if (error.status === 409) {
          throw new Error('Email already exists. Please use a different email.');
        } else {
          const msg = error.error?.message || 'Registration failed. Please try again later.';
          throw new Error(msg);
        }
      })
    );
  }

  login(credentials: { usernameOrEmail: string; password: string }): Observable<any> {
    const payload = {
      email: credentials.usernameOrEmail,
      username: credentials.usernameOrEmail,
      password: credentials.password,
    };

    return this.http.post(`${environment.apiUrl}/auth/login`, payload).pipe(
      map((response: any) => {
        console.log('Login Response:', response); // Debug

        // Store tokens, username, and role in localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        localStorage.setItem('email', response.email);
        if (response.avatar) localStorage.setItem('avatar', response.avatar);
        localStorage.setItem('roles', JSON.stringify(response.roles)); // Store the roles array

        // Update the tokenSubject with the new accessToken
        this.tokenSubject.next(response.accessToken);

        // Redirect based on the user's role
        this.redirectBasedOnRole(response.roles);

        return response;
      }),
      catchError((error) => {
        if (error.status === 400) {
          throw new Error('Invalid credentials. Please check your username/email and password.');
        } else {
          throw new Error('Login failed. Please try again later.');
        }
      })
    );
  }

  public getUsername(): string | null {
    return localStorage.getItem('username');
  }

  public getUserRoles(): string[] {
    const rolesStr = localStorage.getItem('roles');
    if (rolesStr) {
      try {
        return JSON.parse(rolesStr);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  private redirectBasedOnRole(roles: string[] | null): void {
    if (!roles || roles.length === 0) {
      this.router.navigate(['/login']);
      return;
    }
  
    if (roles.includes('admin')) {
      this.router.navigate(['/admin-dashboard']);
    } else if (roles.includes('seller')) {
      this.router.navigate(['/sheller-dashboard']);
    } else if (roles.includes('customer')) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      return throwError('No access token found. User is already logged out.');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  
    // Call the backend logout API (if available)
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers }).pipe(
      map((response: any) => {
        // Clear local storage and update tokenSubject
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('avatar');
        localStorage.removeItem('roles');
        this.tokenSubject.next(null);
        this.router.navigate(['/login']); // Redirect to login page
        return response;
      }),
      catchError((error) => {
        console.error('Logout failed:', error);
        // Even if the API call fails, clear local storage and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('avatar');
        localStorage.removeItem('roles');
        this.tokenSubject.next(null);
        this.router.navigate(['/login']);
        return throwError('Logout failed. Please try again.');
      })
    );
  }

  refreshAccessToken(): Observable<string> {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return throwError('No refresh token found. Please log in again.');
  }

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  return this.http
    .post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken }, { headers })
    .pipe(
      map((response) => {
        const newAccessToken = response.accessToken;
        localStorage.setItem('accessToken', newAccessToken); // Update the access token
        this.tokenSubject.next(newAccessToken); // Update the token subject
        return newAccessToken;
      }),
      catchError((error) => {
        console.error('Error refreshing token:', error);
        this.logout(); // Log out the user if token refresh fails
        return throwError('Failed to refresh token. Please log in again.');
      })
    );
}

  updateProfile(formData: FormData): Observable<any> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return throwError('No access token found. Please log in again.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.put(`${environment.apiUrl}/auth/profile`, formData, { headers }).pipe(
      map((response: any) => {
        // Update local storage
        if (response.user.username) localStorage.setItem('username', response.user.username);
        if (response.user.email) localStorage.setItem('email', response.user.email);
        if (response.user.avatar) localStorage.setItem('avatar', response.user.avatar);
        this.profileUpdatedSubject.next(true); // Notify listeners
        return response;
      }),
      catchError((error) => {
        return throwError(error.error?.message || 'Failed to update profile');
      })
    );
  }

  becomeSeller(sellerDetails: {
    storeName: string;
    storeDescription: string;
    contactNumber: string;
    storeAddress: string;
  }): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      return throwError('No access token found. Please log in again.');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  
    return this.http.post(`${environment.apiUrl}/auth/become-seller`, sellerDetails, { headers }).pipe(
      map((response: any) => {
        console.log("Response from become-seller API:", response);
        // Update the user's roles array to include 'seller' in localStorage
        const currentRoles = this.getUserRoles();
        if (!currentRoles.includes('seller')) {
          currentRoles.push('seller');
        }
        localStorage.setItem('roles', JSON.stringify(currentRoles));
        this.redirectBasedOnRole(['seller']); // Redirect to the seller dashboard
  
        return response;
      }),
      catchError((error) => {
        console.error("Error in becomeSeller API call:", error);
        if (error.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.status === 400) {
          throw new Error('You are already a seller!');
        } else {
          throw new Error('Failed to become a seller. Please try again later.');
        }
      })
    );
  }





  getAllUsers(): Observable<any> {
    const accessToken = this.getAccessToken(); // Get the access token from localStorage
  
    if (!accessToken) {
      return throwError('No access token found. Please log in again.');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}` // Include the access token in the request headers
    });
  
    return this.http.get(`${environment.apiUrl}/auth/users`, { headers }).pipe(
      map((response: any) => {
        return response; // Return the list of users
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        if (error.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.status === 403) {
          throw new Error('Access denied. Admin role required.');
        } else {
          throw new Error('Failed to fetch users. Please try again later.');
        }
      })
    );
  }


  getUserById(userId: string): Observable<any> {
    const token = localStorage.getItem('accessToken'); // Get the access token from localStorage
  
    if (!token) {
      return throwError('No access token found. Please log in again.');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Include the access token in the request headers
    });
  
    return this.http.get(`${environment.apiUrl}/auth/users/${userId}`, { headers }).pipe(
      map((response: any) => {
        return response; // Return the user details
      }),
      catchError((error) => {
        console.error('Error fetching user:', error);
        if (error.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.status === 404) {
          throw new Error('User not found.');
        } else {
          throw new Error('Failed to fetch user details. Please try again later.');
        }
      })
    );
  }


  getLoginHistory(userId: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      return throwError('No access token found. Please log in again.');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get(`${environment.apiUrl}/auth/users/${userId}/login-history`, { headers }).pipe(
      map((response: any) => {
        return response; // Return the login history
      }),
      catchError((error) => {
        console.error('Error fetching login history:', error);
        if (error.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.status === 404) {
          throw new Error('User not found.');
        } else {
          throw new Error('Failed to fetch login history. Please try again later.');
        }
      })
    );
  }



  deleteUser(userId: string): Observable<any> {
    const accessToken = this.getAccessToken(); // Get the access token from localStorage
  
    if (!accessToken) {
      return throwError('No access token found. Please log in again.');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}` // Include the access token in the request headers
    });
  
    return this.http.delete(`${environment.apiUrl}/auth/users/${userId}`, { headers }).pipe(
      map((response: any) => {
        return response; // Return the success message
      }),
      catchError((error) => {
        console.error('Error deleting user:', error);
        if (error.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.status === 404) {
          throw new Error('User not found.');
        } else {
          throw new Error('Failed to delete user. Please try again later.');
        }
      })
    );
  }

  blockUser(userId: string): Observable<any> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return throwError('No access token found. Please log in again.');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });
    return this.http.put(`${environment.apiUrl}/admin/users/${userId}/block`, {}, { headers }).pipe(
      map((response: any) => response),
      catchError((error) => {
        console.error('Error blocking user:', error);
        return throwError('Failed to block user. Please try again later.');
      })
    );
  }

  unblockUser(userId: string): Observable<any> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return throwError('No access token found. Please log in again.');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });
    return this.http.put(`${environment.apiUrl}/admin/users/${userId}/unblock`, {}, { headers }).pipe(
      map((response: any) => response),
      catchError((error) => {
        console.error('Error unblocking user:', error);
        return throwError('Failed to unblock user. Please try again later.');
      })
    );
  }
}