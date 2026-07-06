import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface BaixaDialogData {
  titulo: any;
}

@Component({
  selector: 'app-baixa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './baixa-dialog.component.html',
  styles: [`
    .baixa-info {
      background: #131313;
      border: 1px solid #282828;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .baixa-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #222222;
    }
    .baixa-info-row:last-child { border-bottom: none; }
    .baixa-info-row.destaque {
      padding-top: 12px;
      margin-top: 4px;
    }
    .info-label {
      font-size: 13px;
      color: #acacac;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
    .info-value.valor {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, #4caf50, #81c784);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `],
})
export class BaixaDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BaixaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BaixaDialogData,
  ) {
    const hoje = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      valorPago: [Number(data.titulo.valor), [Validators.required, Validators.min(0.01)]],
      dataPagamento: [hoje, [Validators.required]],
    });
  }

  onConfirm(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
