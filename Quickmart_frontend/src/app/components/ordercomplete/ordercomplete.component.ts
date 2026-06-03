import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-ordercomplete',
  templateUrl: './ordercomplete.component.html',
  styleUrls: ['./ordercomplete.component.css']
})
export class OrdercompleteComponent implements AfterViewInit {

  constructor(private router: Router) {}

  // ✅ Function to Navigate & Close Modal
  navigateToHome() {
    this.closeModal();
    this.router.navigate(['/home']).then(() => {
      this.resetPageScroll(); // Reset scroll position and enable scrolling
    });
  }

  navigateToOrderHistory() {
    this.closeModal();
    this.router.navigate(['/history']).then(() => {
      this.resetPageScroll(); // Reset scroll position and enable scrolling
    });
  }

  // ✅ Function to Close Modal Properly
  closeModal() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
      // Hide the modal using Bootstrap's method
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide(); // Properly hide the modal
      }

      // Remove the modal backdrop if it exists
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // Enable body scrolling
      document.body.style.overflow = 'auto';
    }
  }

  // ✅ Function to Reset Page Scroll
  resetPageScroll() {
    window.scrollTo(0, 0); // Reset scroll position to top
    document.body.style.overflow = 'auto'; // Ensure scrolling is enabled
  }

  ngAfterViewInit() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
      const myModal = new bootstrap.Modal(modal);
      myModal.show(); // Show modal on page load
    }
  }
}