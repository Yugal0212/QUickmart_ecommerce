import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet,NgIf,NavbarComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  hideHeaderFooter: boolean = false;
  showSplash: boolean = true;

  constructor(private router: Router, private viewportScroller: ViewportScroller) {}

  ngOnInit() {
    this.updateLayout(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateLayout(this.router.url);
        setTimeout(() => this.scrollToTop(), 50); // Delay allows DOM to render new page before scrolling
      });

    // Hide splash screen after components have time to fetch data
    setTimeout(() => {
      this.showSplash = false;
    }, 1500);
  }

  private updateLayout(url: string) {
    // Hide header/footer on login and dashboard routes
    this.hideHeaderFooter = url.includes('login') || 
                            url.includes('admin-dashboard') || 
                            url.includes('sheller-dashboard');
  }

  private scrollToTop() {
    // Ultra-aggressive scrolling to catch all edge cases
    this.viewportScroller.scrollToPosition([0, 0]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

}