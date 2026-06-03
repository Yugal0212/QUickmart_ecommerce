import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './pages/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { SingUpFormComponent } from './components/sing-up-form/sing-up-form.component';
import { HomeComponent } from './pages/home/home.component';
import { AddressComponent } from './components/address/address.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { AllproductsComponent } from './components/allproducts/allproducts.component';
import { ProductdetailsComponent } from './components/productdetails/productdetails.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { PaymentComponent } from './components/payment/payment.component';
import { OrderPageComponent } from './pages/order/order.component';
import { AddressFormComponent } from './components/address/address-form/address-form.component';
import { OrdercompleteComponent } from './components/ordercomplete/ordercomplete.component';
import { BecomeSellerComponent } from './components/become-seller/become-seller.component';
import { SellerApplicationStatusComponent } from './pages/seller-application-status/seller-application-status.component';
import { AuthService } from './Services/auth.service';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { ProductCategoryComponent } from './components/product-category/product-category.component';
import { CategoryDetailsComponent } from './components/category-details/category-details.component';
import { OrderHistoryComponent } from './components/orderhistory/orderhistory.component';
import { ProductListComponent } from './components/components/product-list/product-list.component';
import { CategoryListComponent } from './components/components/category-list/category-list.component';
import { AddProductComponent } from './components/components/add-product/add-product.component';
import { AddCategoryComponent } from './components/components/add-category/add-category.component';
import { UserManageComponent } from './components/components/user-manage/user-manage.component';
import { UserDetailsComponent } from './components/components/user-details/user-details.component';
import { SellerOverviewComponent } from './components/components/seller-overview/seller-overview.component';
import { SellerOrdersComponent } from './components/components/seller-orders/seller-orders.component';
import { SellerInventoryComponent } from './components/components/seller-inventory/seller-inventory.component';
import { SellerCustomersComponent } from './components/components/seller-customers/seller-customers.component';
import { SellerReviewsComponent } from './components/components/seller-reviews/seller-reviews.component';
import { SellerWalletComponent } from './components/components/seller-wallet/seller-wallet.component';
import { SellerReportsComponent } from './components/components/seller-reports/seller-reports.component';
import { SellerSettingsComponent } from './components/components/seller-settings/seller-settings.component';
import { AdminOverviewComponent } from './components/components/admin-overview/admin-overview.component';
import { SellerRequestsComponent } from './components/components/seller-requests/seller-requests.component';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    children: [
      { path: 'sign-in', component: LoginFormComponent },
      { path: 'sign-up', component: SingUpFormComponent },
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' } ,
      { path: '**', redirectTo: 'sign-in' }, // Wildcard route for any undefined paths
    ]
    
  },

  {
    path: 'order',
    component: OrderPageComponent,
    children: [
      { path: 'address', component: AddressComponent },
      {path:'Add-address', component: AddressFormComponent},
      {path:'Add-address/:id', component: AddressFormComponent},
      { path: 'order-summary', component: OrderSummaryComponent },
      { path: 'order-payment', component: PaymentComponent },
      {path:'complete',component:OrdercompleteComponent},
      
      { path: '', redirectTo: 'address', pathMatch: 'full' }  // Default to Address step
    ]
  },

  {path :'history', component: OrderHistoryComponent},
  {
    path: 'sheller-dashboard', component:SellerDashboardComponent,canActivate: [AuthService],
    children: [
      { path: 'overview', component: SellerOverviewComponent },
      { path: 'add-product', component: AddProductComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'orders', component: SellerOrdersComponent },
      { path: 'inventory', component: SellerInventoryComponent },
      { path: 'customers', component: SellerCustomersComponent },
      { path: 'reviews', component: SellerReviewsComponent },
      { path: 'wallet', component: SellerWalletComponent },
      { path: 'reports', component: SellerReportsComponent },
      { path: 'settings', component: SellerSettingsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
    ],
  },
  { path: '', redirectTo: '/sheller-dashboard', pathMatch: 'full' },


  {
    path: 'admin-dashboard', component:AdminPanelComponent,canActivate: [AuthService],
    children: [
      { path: 'overview', component: AdminOverviewComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'add-product', component: AddProductComponent },
      { path: 'add-category', component: AddCategoryComponent },
      {path:'add-category/:id', component:AddCategoryComponent},
      { path: 'Users-manage', component: UserManageComponent },
      { path: 'user-details/:id', component: UserDetailsComponent },
      { path: 'seller-requests', component: SellerRequestsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
    ],
  },
  { path: '', redirectTo: '/admin-dashboard', pathMatch: 'full' },


  {path:'become-seller',component:BecomeSellerComponent},
  {path:'seller-application-status',component:SellerApplicationStatusComponent},
  {path:'allproducts', component:AllproductsComponent},
  {path:'productdetails/:id', component:ProductdetailsComponent},
  {path:'cart',component:CartComponent},
  { path: 'home', component: HomeComponent,canActivate: [AuthService] }, // Home route



  {path:'category-details/:id', component:CategoryDetailsComponent},
  
  

  

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
