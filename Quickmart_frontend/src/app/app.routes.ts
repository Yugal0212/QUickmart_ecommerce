import { Routes, RouterModule, ExtraOptions, Router } from '@angular/router';
import { NgModule, inject } from '@angular/core';
















import { AuthService } from './Services/auth.service';



































export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent),
    children: [
      { path: 'sign-in', loadComponent: () => import('./components/login-form/login-form.component').then(c => c.LoginFormComponent) },
      { path: 'sign-up', loadComponent: () => import('./components/sing-up-form/sing-up-form.component').then(c => c.SingUpFormComponent) },
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' } ,
      { path: '**', redirectTo: 'sign-in' }, // Wildcard route for any undefined paths
    ]
    
  },

  {
    path: 'order',
    loadComponent: () => import('./pages/order/order.component').then(c => c.OrderPageComponent),
    children: [
      { path: 'address', loadComponent: () => import('./components/address/address.component').then(c => c.AddressComponent) },
      {path:'Add-address', loadComponent: () => import('./components/address/address-form/address-form.component').then(c => c.AddressFormComponent)},
      {path:'Add-address/:id', loadComponent: () => import('./components/address/address-form/address-form.component').then(c => c.AddressFormComponent)},
      { path: 'order-summary', loadComponent: () => import('./components/order-summary/order-summary.component').then(c => c.OrderSummaryComponent) },
      { path: 'order-payment', loadComponent: () => import('./components/payment/payment.component').then(c => c.PaymentComponent) },
      {path:'complete',loadComponent: () => import('./components/ordercomplete/ordercomplete.component').then(c => c.OrdercompleteComponent)},
      
      { path: '', redirectTo: 'address', pathMatch: 'full' }  // Default to Address step
    ]
  },

  {path :'history', loadComponent: () => import('./components/orderhistory/orderhistory.component').then(c => c.OrderHistoryComponent)},
  {
    path: 'sheller-dashboard', loadComponent: () => import('./pages/seller-dashboard/seller-dashboard.component').then(c => c.SellerDashboardComponent),canActivate: [AuthService],
    children: [
      { path: 'overview', loadComponent: () => import('./components/components/seller-overview/seller-overview.component').then(c => c.SellerOverviewComponent) },
      { path: 'add-product', loadComponent: () => import('./components/components/add-product/add-product.component').then(c => c.AddProductComponent) },
      { path: 'products', loadComponent: () => import('./components/components/product-list/product-list.component').then(c => c.ProductListComponent) },
      { path: 'categories', loadComponent: () => import('./components/components/category-list/category-list.component').then(c => c.CategoryListComponent) },
      { path: 'orders', loadComponent: () => import('./components/components/seller-orders/seller-orders.component').then(c => c.SellerOrdersComponent) },
      { path: 'inventory', loadComponent: () => import('./components/components/seller-inventory/seller-inventory.component').then(c => c.SellerInventoryComponent) },
      { path: 'customers', loadComponent: () => import('./components/components/seller-customers/seller-customers.component').then(c => c.SellerCustomersComponent) },
      { path: 'reviews', loadComponent: () => import('./components/components/seller-reviews/seller-reviews.component').then(c => c.SellerReviewsComponent) },
      { path: 'wallet', loadComponent: () => import('./components/components/seller-wallet/seller-wallet.component').then(c => c.SellerWalletComponent) },
      { path: 'reports', loadComponent: () => import('./components/components/seller-reports/seller-reports.component').then(c => c.SellerReportsComponent) },
      { path: 'settings', loadComponent: () => import('./components/components/seller-settings/seller-settings.component').then(c => c.SellerSettingsComponent) },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
    ],
  },


  {
    path: 'admin-dashboard', loadComponent: () => import('./pages/admin-panel/admin-panel.component').then(c => c.AdminPanelComponent),canActivate: [AuthService],
    children: [
      { path: 'overview', loadComponent: () => import('./components/components/admin-overview/admin-overview.component').then(c => c.AdminOverviewComponent) },
      { path: 'products', loadComponent: () => import('./components/components/admin-products/admin-products.component').then(c => c.AdminProductsComponent) },
      { path: 'categories', loadComponent: () => import('./components/components/category-list/category-list.component').then(c => c.CategoryListComponent) },
      { path: 'add-product', loadComponent: () => import('./components/components/add-product/add-product.component').then(c => c.AddProductComponent) },
      { path: 'add-category', loadComponent: () => import('./components/components/add-category/add-category.component').then(c => c.AddCategoryComponent) },
      { path: 'add-category/:id', loadComponent: () => import('./components/components/add-category/add-category.component').then(c => c.AddCategoryComponent) },
      { path: 'users', loadComponent: () => import('./components/components/user-manage/user-manage.component').then(c => c.UserManageComponent) },
      { path: 'user-details/:id', loadComponent: () => import('./components/components/user-details/user-details.component').then(c => c.UserDetailsComponent) },
      { path: 'sellers', loadComponent: () => import('./components/components/admin-sellers/admin-sellers.component').then(c => c.AdminSellersComponent) },
      { path: 'seller-requests', loadComponent: () => import('./components/components/seller-requests/seller-requests.component').then(c => c.SellerRequestsComponent) },
      { path: 'orders', loadComponent: () => import('./components/components/admin-orders/admin-orders.component').then(c => c.AdminOrdersComponent) },
      { path: 'reports', loadComponent: () => import('./components/components/admin-reports/admin-reports.component').then(c => c.AdminReportsComponent) },
      { path: 'audit-logs', loadComponent: () => import('./components/components/admin-audit-logs/admin-audit-logs.component').then(c => c.AdminAuditLogsComponent) },
      
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
    ],
  },


  {path:'become-seller',loadComponent: () => import('./components/become-seller/become-seller.component').then(c => c.BecomeSellerComponent)},
  {path:'seller-application-status',loadComponent: () => import('./pages/seller-application-status/seller-application-status.component').then(c => c.SellerApplicationStatusComponent)},
  {path:'profile', loadComponent: () => import('./pages/user-profile/user-profile.component').then(c => c.UserProfileComponent)},
  {path:'allproducts', loadComponent: () => import('./components/allproducts/allproducts.component').then(c => c.AllproductsComponent)},
  {path:'productdetails/:id', loadComponent: () => import('./components/productdetails/productdetails.component').then(c => c.ProductdetailsComponent)},
  {path:'cart',loadComponent: () => import('./components/cart/cart.component').then(c => c.CartComponent)},
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent) }, // Home route
  { 
    path: '', 
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      const roles = auth.getUserRoles();
      if (roles && roles.length > 0 && auth.getAccessToken()) {
        if (roles.includes('admin')) return router.parseUrl('/admin-dashboard');
        if (roles.includes('seller')) return router.parseUrl('/sheller-dashboard');
      }
      return true;
    }]
  },


  {path:'category-details/:id', loadComponent: () => import('./components/category-details/category-details.component').then(c => c.CategoryDetailsComponent)},
  
  // Wildcard 404 Route
  {path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(c => c.NotFoundComponent)}
];


const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'top', // Scroll to the top on route changes
  anchorScrolling: 'enabled', // Enable anchor scrolling
};

@NgModule({
  imports: [RouterModule.forRoot(routes,routerOptions),],
  exports: [RouterModule]
})
export class AppRoutingModule {}
