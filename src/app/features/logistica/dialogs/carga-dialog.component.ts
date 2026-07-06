import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LogisticaService, Entrega } from '../services/logistica.service';

export interface CargaDialogData {
  entregas: Entrega[];
}

@Component({
  selector: 'app-carga-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">local_shipping</mat-icon>
      Montar Romaneio de Carga
    </h2>

    <mat-dialog-content class="dialog-content">
      <div class="split-layout">
        <!-- Form de Embarque -->
        <form [formGroup]="form" class="carga-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Motorista / Transportador</mat-label>
            <input matInput formControlName="motorista" placeholder="Ex: Carlos Santos ou Frete Terceirizado" />
            <mat-error *ngIf="form.get('motorista')?.hasError('required')">
              Nome do motorista é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Placa do Veículo</mat-label>
            <input matInput formControlName="placaVeiculo" placeholder="Ex: ABC-1234" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Observações do Romaneio</mat-label>
            <textarea matInput formControlName="observacoes" rows="3" placeholder="Ex: Conferir amarração, carga pesada de cimento..."></textarea>
          </mat-form-field>
        </form>

        <!-- Lista e Sequência de Entregas -->
        <div class="route-builder">
          <h3>Definição da Fila de Desembarque (Rotas)</h3>
          <p class="help-text">Use as setas para ordenar a sequência ideal de entrega (do 1º ao último drop).</p>

          <div class="delivery-sequence-list">
            @for (ent of entregas; track ent.id; let idx = $index) {
              <div class="seq-item">
                <div class="seq-badge">{{ idx + 1 }}</div>
                <div class="seq-details">
                  <span class="client-name">{{ ent.venda?.cliente?.nome || 'Consumidor Final' }}</span>
                  <span class="address">{{ ent.enderecoEntrega }}, {{ ent.cidade }}</span>
                  <span class="venda-badge">Venda #{{ ent.vendaId }}</span>
                </div>
                <div class="seq-actions">
                  <button mat-icon-button type="button" [disabled]="idx === 0" (click)="moveUp(idx)">
                    <mat-icon>keyboard_arrow_up</mat-icon>
                  </button>
                  <button mat-icon-button type="button" [disabled]="idx === entregas.length - 1" (click)="moveDown(idx)">
                    <mat-icon>keyboard_arrow_down</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="onSave()">
        <mat-icon>done</mat-icon> Confirmar e Criar Romaneio
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
      color: var(--nexa-text, #ffffff);
    }
    .dialog-content {
      padding: 20px 24px !important;
      min-width: 750px;
      max-width: 95vw;
    }
    .split-layout {
      display: grid;
      grid-template-columns: 1.2fr 1.8fr;
      gap: 24px;
    }
    @media (max-width: 768px) {
      .dialog-content {
        min-width: 0 !important;
        width: 100%;
        padding: 16px !important;
        box-sizing: border-box;
        overflow-x: hidden;
      }
      .split-layout {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }
      .full-width {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box;
      }
    }
    .carga-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .full-width {
      width: 100%;
    }
    .route-builder {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .route-builder h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--nexa-text, #ffffff);
    }
    .help-text {
      margin: 0 0 8px 0;
      font-size: 11.5px;
      color: var(--nexa-text-secondary, #9f9f9f);
    }
    .delivery-sequence-list {
      max-height: 250px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-right: 8px;
    }
    .delivery-sequence-list::-webkit-scrollbar {
      width: 6px;
    }
    .delivery-sequence-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .seq-item {
      background: var(--nexa-surface-light, rgba(255, 255, 255, 0.02));
      border: 1px solid var(--nexa-border, rgba(255, 255, 255, 0.06));
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seq-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(249, 115, 22, 0.15);
      border: 1px solid rgba(249, 115, 22, 0.3);
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
    }
    .seq-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .client-name {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--nexa-text, #ffffff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .address {
      font-size: 11.5px;
      color: var(--nexa-text-secondary, #9f9f9f);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 250px;
    }
    .venda-badge {
      font-size: 10px;
      color: #f97316;
      font-weight: 600;
    }
    .seq-actions {
      display: flex;
      gap: 4px;
    }
    .seq-actions button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    .dialog-footer {
      padding: 16px 24px !important;
    }
  `]
})
export class CargaDialogComponent implements OnInit {
  form!: FormGroup;
  entregas!: Entrega[];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private logisticaService: LogisticaService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CargaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CargaDialogData
  ) {}

  ngOnInit(): void {
    this.entregas = [...this.data.entregas];
    this.form = this.fb.group({
      motorista: ['', [Validators.required, Validators.maxLength(255)]],
      placaVeiculo: ['', [Validators.maxLength(20)]],
      observacoes: ['', [Validators.maxLength(2000)]],
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const temp = this.entregas[index];
    this.entregas[index] = this.entregas[index - 1];
    this.entregas[index - 1] = temp;
  }

  moveDown(index: number): void {
    if (index === this.entregas.length - 1) return;
    const temp = this.entregas[index];
    this.entregas[index] = this.entregas[index + 1];
    this.entregas[index + 1] = temp;
  }

  onSave(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const val = this.form.value;
    const ids = this.entregas.map((e) => e.id);

    this.logisticaService.criarCarga(
      val.motorista,
      val.placaVeiculo,
      ids,
      val.observacoes
    ).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Romaneio de Carga gerado com sucesso!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erro ao gerar carga.', 'Fechar', { duration: 4000 });
      }
    });
  }
}
