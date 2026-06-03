import { Component, OnInit } from '@angular/core';
import { SellerService, SellerApplication } from '../../Services/seller.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-seller-application-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div class="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden mt-10 border border-gray-100">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 px-8 py-10 text-white text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div class="relative z-10">
            <i class="fas fa-clipboard-check text-5xl mb-4 opacity-90"></i>
            <h2 class="text-3xl font-extrabold tracking-tight">Application Status</h2>
            <p class="mt-2 text-green-100 text-lg">Track your journey to becoming a QuickMartNexa seller.</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8 sm:p-12">
          
          <div *ngIf="isLoading" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>

          <div *ngIf="!isLoading && application" class="space-y-10">
            
            <!-- Store Info -->
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900">{{ application.storeName }}</h3>
              <p class="text-gray-500">{{ application.businessName }}</p>
            </div>

            <!-- Timeline -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t-2 border-gray-200"></div>
                <!-- Active Line -->
                <div class="absolute left-0 w-1/2 border-t-2 border-green-500 transition-all duration-1000"
                     [style.width]="application.status === 'approved' ? '100%' : (application.status === 'rejected' ? '100%' : '50%')"></div>
              </div>
              <div class="relative flex justify-between">
                
                <!-- Step 1: Submitted -->
                <div class="flex flex-col items-center">
                  <div class="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-white shadow-sm z-10">
                    <i class="fas fa-check text-white"></i>
                  </div>
                  <span class="mt-3 text-sm font-semibold text-green-600">Submitted</span>
                  <span class="text-xs text-gray-500">{{ application.createdAt | date:'MMM d' }}</span>
                </div>

                <!-- Step 2: Under Review -->
                <div class="flex flex-col items-center">
                  <div class="h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm z-10"
                       [ngClass]="{'bg-green-500': application.status !== 'pending', 'bg-blue-500 animate-pulse': application.status === 'pending'}">
                    <i class="fas fa-search text-white"></i>
                  </div>
                  <span class="mt-3 text-sm font-semibold"
                        [ngClass]="{'text-green-600': application.status !== 'pending', 'text-blue-600': application.status === 'pending'}">
                    Review
                  </span>
                </div>

                <!-- Step 3: Decision -->
                <div class="flex flex-col items-center">
                  <div class="h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm z-10"
                       [ngClass]="{
                         'bg-gray-200': application.status === 'pending',
                         'bg-green-500': application.status === 'approved',
                         'bg-red-500': application.status === 'rejected'
                       }">
                    <i class="fas" [ngClass]="{
                      'fa-clock text-gray-400': application.status === 'pending',
                      'fa-check text-white': application.status === 'approved',
                      'fa-times text-white': application.status === 'rejected'
                    }"></i>
                  </div>
                  <span class="mt-3 text-sm font-semibold"
                        [ngClass]="{
                          'text-gray-400': application.status === 'pending',
                          'text-green-600': application.status === 'approved',
                          'text-red-600': application.status === 'rejected'
                        }">
                    {{ application.status === 'pending' ? 'Decision' : (application.status === 'approved' ? 'Approved' : 'Rejected') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Messages based on status -->
            <div class="mt-8 rounded-2xl p-6 text-center border"
                 [ngClass]="{
                   'bg-blue-50 border-blue-100': application.status === 'pending',
                   'bg-green-50 border-green-100': application.status === 'approved',
                   'bg-red-50 border-red-100': application.status === 'rejected'
                 }">
              
              <div *ngIf="application.status === 'pending'">
                <h4 class="text-lg font-bold text-blue-900 mb-2">Application Under Review</h4>
                <p class="text-blue-700">Our team is currently reviewing your business details. This usually takes 24-48 hours. We will notify you once a decision is made.</p>
              </div>

              <div *ngIf="application.status === 'approved'">
                <h4 class="text-lg font-bold text-green-900 mb-2">Congratulations! 🎉</h4>
                <p class="text-green-700 mb-4">Your application has been approved. You can now access your Seller Dashboard and start listing products.</p>
                <button (click)="goToDashboard()" class="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors">
                  Go to Dashboard
                </button>
              </div>

              <div *ngIf="application.status === 'rejected'">
                <h4 class="text-lg font-bold text-red-900 mb-2">Application Rejected</h4>
                <p class="text-red-700 mb-4">{{ application.adminRemark || application.rejectionReason || 'Unfortunately, your application did not meet our requirements at this time.' }}</p>
                <button routerLink="/become-seller" class="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-full font-bold hover:bg-red-50 transition-colors">
                  Update & Re-apply
                </button>
              </div>

            </div>
          </div>

          <div *ngIf="!isLoading && !application" class="text-center py-10">
            <h3 class="text-xl font-bold text-gray-900 mb-2">No Application Found</h3>
            <p class="text-gray-500 mb-6">You haven't applied to become a seller yet.</p>
            <button routerLink="/become-seller" class="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
              Apply Now
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SellerApplicationStatusComponent implements OnInit {
  application: SellerApplication | null = null;
  isLoading = true;

  constructor(private sellerService: SellerService, private router: Router) {}

  ngOnInit(): void {
    this.sellerService.getApplicationStatus().subscribe({
      next: (app) => {
        this.application = app;
        this.isLoading = false;
        
        // If approved, maybe refresh token to get new roles, but we already added 'seller' to local roles in login.
        // Wait, 'approve' happens on admin side. User needs to login again or we refresh.
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  goToDashboard() {
    // If roles array doesn't have seller yet (because admin approved it while user was logged in),
    // we should append it to localstorage so the guard lets them in.
    const rolesStr = localStorage.getItem('roles');
    if (rolesStr) {
      let roles = JSON.parse(rolesStr);
      if (!roles.includes('seller')) {
        roles.push('seller');
        localStorage.setItem('roles', JSON.stringify(roles));
      }
    }
    
    // Force reload to update navbar and guards correctly
    window.location.href = '/sheller-dashboard';
  }
}
