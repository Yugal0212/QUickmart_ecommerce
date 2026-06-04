import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../Services/Order/order.service';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-order-history',
  imports:[CommonModule,NgClass],
  templateUrl: './orderhistory.component.html',
  styleUrls: ['./orderhistory.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;
  selectedOrder: any = null; // For the View Receipt Modal

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // Fetch User Orders
  fetchOrders(): void {
    this.orderService.getMyOrders().subscribe(
      (response) => {
        this.orders = response.orders;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching orders:', error);
        this.isLoading = false;
      }
    );
  }

  // Cancel Order
  cancelOrder(orderId: string): void {
    this.orderService.cancelOrder(orderId).subscribe(
      (response) => {
        Swal.fire({ text: 'Order cancelled successfully', confirmButtonColor: '#255ff4' });
        this.fetchOrders(); // Refresh the order list
      },
      (error) => {
        console.error('Error cancelling order:', error);
        Swal.fire({ text: 'Failed to cancel order. Please try again.', confirmButtonColor: '#255ff4' });
      }
    );
  }

  // Set the order for the View Modal
  viewReceipt(order: any): void {
    this.selectedOrder = order;
  }

  // Generate and Download PDF Receipt
  downloadReceipt(order: any): void {
    const doc = new jsPDF();
    const datePipe = new DatePipe('en-US');
    const orderDate = datePipe.transform(order.createdAt, 'medium') || '';
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(47, 125, 50); // Primary green color
    doc.text('QuickmartNexa', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Order Receipt', 14, 30);
    
    // Order Info
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Order ID: ${order._id}`, 14, 40);
    doc.text(`Date: ${orderDate}`, 14, 46);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, 52);
    doc.text(`Payment Status: ${order.paymentStatus}`, 14, 58);
    
    // Shipping Details
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Shipping Address:', 120, 40);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const addr = order.shippingAddress;
    doc.text(`${addr.fullName}`, 120, 46);
    doc.text(`${addr.addressLine1}`, 120, 52);
    if (addr.addressLine2) doc.text(`${addr.addressLine2}`, 120, 58);
    doc.text(`${addr.city}, ${addr.state} ${addr.zipCode}`, 120, addr.addressLine2 ? 64 : 58);
    doc.text(`Phone: ${addr.phone}`, 120, addr.addressLine2 ? 70 : 64);
    
    // Table
    const tableBody = order.items.map((item: any) => [
      item.name,
      item.quantity.toString(),
      `INR ${item.price ? item.price.toFixed(2) : (item.totalPrice / item.quantity).toFixed(2)}`,
      `INR ${item.totalPrice.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Product', 'Quantity', 'Unit Price', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [47, 125, 50] },
      margin: { top: 10 }
    });
    
    // Total Amount
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: INR ${order.totalAmount.toFixed(2)}`, 14, finalY + 15);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with QuickmartNexa!', 14, finalY + 30);
    
    // Save
    doc.save(`Receipt_${order._id}.pdf`);
  }
}