import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upgrade-overlay',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './upgrade-overlay.component.html',
  styleUrls: ['./upgrade-overlay.component.css']
})
export class UpgradeOverlayComponent {
  constructor(
    public dialogRef: MatDialogRef<UpgradeOverlayComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { requiredPlan: string; feature: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onUpgrade(): void {
    this.dialogRef.close(true);
    this.router.navigate(['/assinatura']);
  }
}
