import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">error_outline</mat-icon>
        <h2>Confirm Action</h2>
      </div>
      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-button class="cancel-btn" (click)="onNoClick()">Cancel</button>
        <button mat-button class="confirm-btn" color="warn" (click)="onConfirm()">Confirm</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    /* Main Dialog Container */
    .dialog-container {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      width: 100%;
      max-width: 400px;
      box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease-in-out;
    }

    /* Header Styling */
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
      color: #222;
    }

    .dialog-header h2 {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .warning-icon {
      color: #ff5722;
      font-size: 28px;
    }

    /* Dialog Content */
    .dialog-content {
      font-size: 1.1rem;
      color: #333;
      padding: 10px;
    }

    /* Dialog Actions (Buttons) */
    .dialog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }

    .cancel-btn, .confirm-btn {
      padding: 10px 18px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 6px;
      transition: all 0.3s ease;
      width: 45%;
    }

    .cancel-btn {
      background: #ddd;
      color: #333;
      border: 2px solid #bbb;
    }

    .cancel-btn:hover {
      background: #bbb;
      color: white;
    }

    .confirm-btn {
      background: #d32f2f;
      color: white;
      border: 2px solid #b71c1c;
    }

    .confirm-btn:hover {
      background: #b71c1c;
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .dialog-container {
        max-width: 90%;
        padding: 20px;
      }
      .dialog-header h2 {
        font-size: 1.2rem;
      }
      .warning-icon {
        font-size: 24px;
      }
      .dialog-content {
        font-size: 1rem;
      }
      .cancel-btn, .confirm-btn {
        font-size: 0.9rem;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
