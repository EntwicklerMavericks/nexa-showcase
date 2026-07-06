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

export interface LancamentoDialogData {
  tipo: 'receber' | 'pagar';
}

@Component({
  selector: 'app-lancamento-dialog',
  standalone: true,
  imports: [NexaSelectComponent, 
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './lancamento-dialog.component.html',
})
export class LancamentoDialogComponent {
  form: FormGroup;

  readonly formasPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CARTAO_CREDITO', label: 'Cartão Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão Débito' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'TRANSFERENCIA', label: 'Transferência' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LancamentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LancamentoDialogData,
  ) {
    const hoje = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      dataVencimento: [hoje, [Validators.required]],
      formaPagamento: ['BOLETO', [Validators.required]],
      parcelas: [1, [Validators.required, Validators.min(1)]],
      observacoes: [''],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
