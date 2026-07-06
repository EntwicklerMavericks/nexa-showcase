import { NexaSelectComponent } from '../../../shared/components/nexa-select/nexa-select.component';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

export interface MovimentacaoDialogData { produtoId?: number; produtoNome?: string; }

@Component({
  selector: 'app-movimentacao-dialog',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './movimentacao-dialog.component.html',
})
export class MovimentacaoDialogComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<MovimentacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MovimentacaoDialogData) {
    this.form = this.fb.group({
      produtoId: [data.produtoId ?? null, [Validators.required]],
      tipo: ['ENTRADA', [Validators.required]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      motivo: [''],
    });
  }
  onSave(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}
