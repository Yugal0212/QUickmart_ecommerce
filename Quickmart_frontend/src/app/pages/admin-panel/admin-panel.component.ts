import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const storedName = this.authService.getUsername();
    if (storedName) {
      this.username = storedName;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => console.log('Successfully logged out'),
      error: (err) => console.error('Logout error:', err)
    });
  }
}
