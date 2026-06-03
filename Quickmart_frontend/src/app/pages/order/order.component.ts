import { Component } from '@angular/core';
import { AddressComponent } from "../../components/address/address.component";
import { OrderSummaryComponent } from "../../components/order-summary/order-summary.component";
import { PaymentComponent } from "../../components/payment/payment.component";
import { ProgressBarComponent } from "../../components/progress-bar/progress-bar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-order-page',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  imports: [ ProgressBarComponent,RouterOutlet]
})
export class OrderPageComponent {
  // currentStep = 1;

  // // Function to update the current step
  // navigateToStep(step: number): void {
  //   this.currentStep = step;
  // }
}
