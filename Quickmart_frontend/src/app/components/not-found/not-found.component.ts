import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    Swal.fire({
      icon: 'error',
      title: 'Page Not Found',
      text: 'The page you are looking for does not exist. Redirecting to home...',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(() => {
      this.router.navigate(['/home']);
    });
  }
}
