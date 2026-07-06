import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Cliente, ClientesService } from '../../clientes/services/clientes.service';
import { Orcamento } from '../services/orcamentos.service';

@Component({
  selector: 'app-converter-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">point_of_sale</mat-icon>
      Converter Orçamento #{{ data.orcamento.numero }} em Venda
    </h2>
    <mat-dialog-content style="padding: 16px 24px; min-width: 320px;">
      <form [formGroup]="form" style="display: flex; flex-direction: column; gap: 12px;">
        <p style="margin: 0 0 8px 0; color: var(--nexa-text-secondary); font-size: 14px;">
          Confirme as informações abaixo para finalizar a venda deste orçamento.
        </p>

        <!-- Cliente -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="clienteId">
            @for (c of clientes; track c.id) {
              <mat-option [value]="c.id">{{ c.nome }} — {{ c.cpfCnpj }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Forma de Pagamento e Parcelas -->
        <div style="display: flex; gap: 12px;">
          <mat-form-field appearance="outline" style="flex: 2;">
            <mat-label>Forma de Pagamento</mat-label>
            <mat-select formControlName="formaPagamento">
              @for (fp of formasPagamento; track fp.value) {
                <mat-option [value]="fp.value">{{ fp.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>Parcelas</mat-label>
            <input matInput formControlName="parcelas" type="number" min="1" />
          </mat-form-field>
        </div>

        <div class="values-summary-card" style="padding: 12px; margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: var(--nexa-text);">
            <span>Valor Total da Venda:</span>
            <span class="nexa-gradient-text">R$ {{ data.orcamento.valorTotal | number:'1.2-2' }}</span>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!form.valid">
        <mat-icon style="margin-right: 6px;">check</mat-icon> Confirmar Venda
      </button>
    </mat-dialog-actions>
  `
})
export class ConverterDialogComponent implements OnInit {
  form: FormGroup;
  clientes: Cliente[] = [];

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
    private dialogRef: MatDialogRef<ConverterDialogComponent>,
    private clientesService: ClientesService,
    @Inject(MAT_DIALOG_DATA) public data: { orcamento: Orcamento }
  ) {
    this.form = this.fb.group({
      clienteId: [data.orcamento.clienteId, [Validators.required]],
      formaPagamento: ['DINHEIRO', [Validators.required]],
      parcelas: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.clientesService.findAll(1, 200).subscribe({
      next: (res) => this.clientes = res.data
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
