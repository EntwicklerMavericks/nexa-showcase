import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LogisticaService } from '../services/logistica.service';

export interface EntregaDialogData {
  vendaId: number;
  clienteNome: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

@Component({
  selector: 'app-entrega-dialog',
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
      Agendar Entrega — Venda #{{ data.vendaId }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <p class="subtitle">
        Destinatário: <strong>{{ data.clienteNome || 'Consumidor Final' }}</strong>
      </p>

      <form [formGroup]="form" (ngSubmit)="onSave()" class="delivery-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Endereço de Entrega (Rua, Número, Bairro)</mat-label>
          <input matInput formControlName="enderecoEntrega" placeholder="Ex: Rua das Flores, 123 - Centro" />
          <mat-error *ngIf="form.get('enderecoEntrega')?.hasError('required')">
            Endereço é obrigatório
          </mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="col-8">
            <mat-label>Cidade</mat-label>
            <input matInput formControlName="cidade" placeholder="Ex: São Paulo" />
            <mat-error *ngIf="form.get('cidade')?.hasError('required')">
              Cidade é obrigatória
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="col-4">
            <mat-label>UF</mat-label>
            <input matInput formControlName="estado" maxLength="2" placeholder="Ex: SP" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="col-12">
            <mat-label>CEP</mat-label>
            <input matInput formControlName="cep" maxLength="9" placeholder="Ex: 01234-567" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observações / Ponto de Referência</mat-label>
          <textarea matInput formControlName="observacoes" rows="3" placeholder="Ex: Entregar após as 14h, portão azul..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="onSave()">
        <mat-icon>done</mat-icon> Confirmar Agendamento
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
    }
    .subtitle {
      margin-bottom: 20px;
      color: var(--nexa-text-secondary, #dfdfdf);
      font-size: 14px;
    }
    .dialog-content {
      padding: 16px 24px !important;
    }
    .delivery-form {
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
    .col-8 {
      flex: 2;
    }
    .col-4 {
      flex: 1;
    }
    .col-12 {
      width: 100%;
    }
    .dialog-footer {
      padding: 12px 24px !important;
    }
  `]
})
export class EntregaDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private logisticaService: LogisticaService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EntregaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EntregaDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      enderecoEntrega: [this.data.endereco ?? '', [Validators.required, Validators.maxLength(500)]],
      cidade: [this.data.cidade ?? '', [Validators.required, Validators.maxLength(100)]],
      estado: [this.data.estado ?? 'SP', [Validators.maxLength(2)]],
      cep: [this.data.cep ?? '', [Validators.maxLength(10)]],
      observacoes: ['', [Validators.maxLength(2000)]],
    });

    this.form.get('cep')?.valueChanges.subscribe((cepValue) => {
      const cleanedCep = (cepValue || '').replace(/\D/g, '');
      if (cleanedCep.length === 8) {
        this.buscarCep(cleanedCep);
      }
    });
  }

  buscarCep(cep: string): void {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.erro) {
          const logradouro = data.logradouro || '';
          const bairro = data.bairro || '';
          let enderecoCompleto = '';
          if (logradouro) enderecoCompleto += logradouro;
          if (bairro) enderecoCompleto += enderecoCompleto ? `, ${bairro}` : bairro;

          this.form.patchValue({
            cidade: data.localidade || '',
            estado: data.uf || '',
          });

          if (enderecoCompleto) {
            this.form.patchValue({
              enderecoEntrega: enderecoCompleto,
            });
          }
          this.snackBar.open('CEP localizado e preenchido com sucesso!', 'OK', { duration: 2000 });
        } else {
          this.snackBar.open('CEP não encontrado.', 'Fechar', { duration: 3000 });
        }
      })
      .catch(() => {
        this.snackBar.open('Erro ao buscar o CEP.', 'Fechar', { duration: 3000 });
      });
  }

  onSave(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const val = this.form.value;

    this.logisticaService.criarEntrega(
      this.data.vendaId,
      val.enderecoEntrega,
      val.cidade,
      val.estado,
      val.cep,
      val.observacoes
    ).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Entrega agendada com sucesso!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erro ao agendar entrega.', 'Fechar', { duration: 4000 });
      }
    });
  }
}
