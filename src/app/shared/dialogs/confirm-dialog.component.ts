import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="premium-confirm-container nexa-fade-in" [class.is-danger]="data.isDanger">
      
      <div class="confirm-icon-wrapper">
        <div class="icon-ring"></div>
        <mat-icon class="confirm-icon" [ngClass]="{'pulse-warn': data.isDanger, 'pulse-primary': !data.isDanger}">
          {{ data.isDanger ? 'warning_amber' : 'help_outline' }}
        </mat-icon>
      </div>

      <h2 mat-dialog-title class="confirm-title">
        {{ data.title || 'Confirmação' }}
      </h2>
      
      <mat-dialog-content class="confirm-content">
        <p [innerHTML]="data.message"></p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="confirm-actions">
        <button mat-button mat-dialog-close class="btn-cancel" type="button">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-flat-button class="btn-confirm" (click)="onConfirm()" type="button">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .nexa-confirm-dialog .mat-mdc-dialog-container .mdc-dialog__surface {
      background: transparent !important;
      box-shadow: none !important;
      overflow: visible !important;
      padding: 0;
      border-radius: 20px;
    }
    
    .premium-confirm-container {
      background: rgba(30, 30, 34, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 32px 24px 24px;
      text-align: center;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      animation: dialogPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Ambient Glow */
    .premium-confirm-container::before {
      content: '';
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 150px; height: 150px;
      background: radial-gradient(circle, rgba(255, 152, 0, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
    }
    .premium-confirm-container.is-danger::before {
      background: radial-gradient(circle, rgba(244, 67, 54, 0.15) 0%, transparent 70%);
    }

    .confirm-icon-wrapper {
      position: relative;
      width: 64px; height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      z-index: 1;
    }

    .icon-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(255, 152, 0, 0.3);
      animation: spinRing 8s linear infinite;
    }
    .is-danger .icon-ring {
      border-color: rgba(244, 67, 54, 0.3);
      border-top-color: rgba(244, 67, 54, 0.8);
    }
    .premium-confirm-container:not(.is-danger) .icon-ring {
      border-top-color: rgba(255, 152, 0, 0.8);
    }

    .confirm-icon {
      font-size: 32px;
      width: 32px; height: 32px;
      color: #FF9800;
      text-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
    }
    .is-danger .confirm-icon {
      color: #F44336;
      text-shadow: 0 0 15px rgba(244, 67, 54, 0.5);
    }

    .confirm-title {
      font-family: 'Inter', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 12px;
      z-index: 1;
      letter-spacing: -0.5px;
    }

    .confirm-content {
      font-size: 15px;
      color: #A0A0AB;
      line-height: 1.6;
      margin-bottom: 32px;
      padding: 0 16px;
      z-index: 1;
      font-weight: 400;
      max-height: none;
    }
    .confirm-content p { margin: 0; }
    .confirm-content b, .confirm-content strong { color: #E0E0E0; font-weight: 600; }

    .confirm-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      width: 100%;
      padding: 0;
      margin: 0;
      z-index: 1;
    }

    .btn-cancel, .btn-confirm {
      flex: 1;
      height: 44px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      letter-spacing: 0.3px !important;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    }

    .btn-cancel {
      color: #A0A0AB !important;
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
    }
    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #FFFFFF !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%) !important;
      color: #121212 !important;
      box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3) !important;
      border: none !important;
    }
    .btn-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4) !important;
      filter: brightness(1.1);
    }
    
    .is-danger .btn-confirm {
      background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%) !important;
      color: #FFFFFF !important;
      box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3) !important;
    }
    .is-danger .btn-confirm:hover {
      box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4) !important;
    }

    @keyframes dialogPop {
      0% { opacity: 0; transform: scale(0.9) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes spinRing {
      100% { transform: rotate(360deg); }
    }
    
    .pulse-primary {
      animation: pulsePrimary 2s infinite;
    }
    @keyframes pulsePrimary {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
