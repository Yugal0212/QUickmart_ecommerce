import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { AuthService } from './Services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { PreloderTwoComponent } from './components/preloder-two/preloder-two.component';

@NgModule({
  declarations: [
    
  ],
  imports: [
    // other modules
    HttpClientModule,
    PreloaderComponent,
    PreloderTwoComponent,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    
  ],
  providers: [
     // Register the interceptor
     { provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true },
     // Register the guard
     AuthService
   
  ],

})
export class AppModule { }