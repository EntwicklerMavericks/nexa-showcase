import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LogisticaService, Entrega } from '../services/logistica.service';

export interface BaixaEntregaDialogData {
  entrega: Entrega;
}

@Component({
  selector: 'app-baixa-entrega-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">local_shipping</mat-icon>
      Baixa de Entrega — Ref. Venda #{{ data.entrega.vendaId }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <p class="summary-text">
        Destinatário: <strong>{{ data.entrega.venda?.cliente?.nome || 'Consumidor Final' }}</strong> <br/>
        Endereço: <span>{{ data.entrega.enderecoEntrega }}, {{ data.entrega.cidade }}</span>
      </p>

      <form [formGroup]="form" class="baixa-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Novo Status</mat-label>
          <mat-select formControlName="status" (selectionChange)="onStatusChange($event.value)">
            <mat-option value="ENTREGUE">Entregue com Sucesso</mat-option>
            <mat-option value="FALHOU">Falha na Entrega (Ocorrência)</mat-option>
            <mat-option value="CANCELADA">Entrega Cancelada</mat-option>
          </mat-select>
        </mat-form-field>

        @if (form.get('status')?.value === 'ENTREGUE') {
          <div class="row">
            <mat-form-field appearance="outline" class="col-6">
              <mat-label>Nome de quem recebeu</mat-label>
              <input matInput formControlName="recebedorNome" placeholder="Ex: Maria (Esposa)" />
              <mat-error *ngIf="form.get('recebedorNome')?.hasError('required')">
                Nome do recebedor é obrigatório
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="col-6">
              <mat-label>Documento (CPF / RG)</mat-label>
              <input matInput formControlName="recebedorDocumento" placeholder="Ex: 123.456.789-00" />
            </mat-form-field>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ form.get('status')?.value === 'ENTREGUE' ? 'Observações' : 'Motivo da Falha / Cancelamento' }}</mat-label>
          <textarea matInput formControlName="observacoes" rows="3" placeholder="Ex: Entregue no portão dos fundos, cliente ausente..."></textarea>
          <mat-error *ngIf="form.get('observacoes')?.hasError('required')">
            O motivo é obrigatório para falha ou cancelamento
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="onSave()">
        <mat-icon>done</mat-icon> Confirmar Baixa
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
    }
    .dialog-content {
      padding: 16px 24px !important;
      min-width: 480px;
      max-width: 95vw;
    }
    .summary-text {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 12px;
      margin: 0 0 20px 0;
      font-size: 13px;
      line-height: 1.5;
      color: #dfdfdf;
    }
    .summary-text strong {
      color: #ffffff;
    }
    .baixa-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .full-width {
      width: 100%;
    }
    .row {
      display: flex;
      gap: 12px;
      width: 100%;
    }
    .col-6 {
      flex: 1;
    }
    .dialog-footer {
      padding: 16px 24px !important;
    }
  `]
})
export class BaixaEntregaDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private logisticaService: LogisticaService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BaixaEntregaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BaixaEntregaDialogData
  ) {}

  ngOnInit(): void {
    const ent = this.data.entrega;
    this.form = this.fb.group({
      status: [ent.status === 'PENDENTE' || ent.status === 'EM_ROTA' ? 'ENTREGUE' : ent.status, [Validators.required]],
      recebedorNome: [ent.recebedorNome ?? ''],
      recebedorDocumento: [ent.recebedorDocumento ?? ''],
      observacoes: [ent.observacoes ?? ''],
    });

    this.onStatusChange(this.form.get('status')?.value);
  }

  onStatusChange(status: string): void {
    const nameCtrl = this.form.get('recebedorNome');
    const obsCtrl = this.form.get('observacoes');

    if (status === 'ENTREGUE') {
      nameCtrl?.setValidators([Validators.required, Validators.maxLength(255)]);
      obsCtrl?.setValidators([Validators.maxLength(2000)]);
    } else {
      nameCtrl?.clearValidators();
      obsCtrl?.setValidators([Validators.required, Validators.maxLength(2000)]);
    }

    nameCtrl?.updateValueAndValidity();
    obsCtrl?.updateValueAndValidity();
  }

  onSave(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const val = this.form.value;

    const entregaId = this.data.entrega.id;
    if (!entregaId) {
      this.snackBar.open('Erro: ID da entrega não encontrado. Tente recarregar a página.', 'Fechar', { duration: 5000 });
      this.loading = false;
      return;
    }

    this.logisticaService.atualizarStatusEntrega(
      entregaId,
      val.status,
      val.recebedorNome || undefined,
      val.recebedorDocumento || undefined,
      val.observacoes || undefined
    ).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Entrega atualizada com sucesso!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erro ao atualizar entrega.', 'Fechar', { duration: 4000 });
      }
    });
  }
}
