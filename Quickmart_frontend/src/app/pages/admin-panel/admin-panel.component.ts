import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  username: string = 'Admin';
  email: string = 'admin@QuickMartNexa.com';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const storedName = this.authService.getUsername();
    const storedEmail = localStorage.getItem('email');
    if (storedName && storedName !== 'undefined') {
      this.username = storedName;
    }
    if (storedEmail && storedEmail !== 'undefined') {
      this.email = storedEmail;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Successfully logged out');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Force navigate anyway
        this.router.navigate(['/login']);
      }
    });
  }
}
