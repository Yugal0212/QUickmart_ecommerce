import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
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

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateLayout(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateLayout(this.router.url);
        this.scrollToTop();
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

}