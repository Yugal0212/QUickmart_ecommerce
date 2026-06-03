import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  username: string = 'Seller';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const storedName = this.authService.getUsername();
    if (storedName) {
      this.username = storedName;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Successfully logged out');
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Logout error:', err)
    });
  }
}
