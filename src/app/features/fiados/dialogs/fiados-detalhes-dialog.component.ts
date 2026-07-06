import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FiadosService } from '../services/fiados.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-fiados-detalhes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <h2 mat-dialog-title>Detalhamento de Fiado - {{ data.cliente.nome }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <div style="padding: 24px; text-align: center;">Carregando...</div>
      } @else {
        <table mat-table [dataSource]="contas()" class="mat-elevation-z0" style="width: 100%;">
          
          <ng-container matColumnDef="venda">
            <th mat-header-cell *matHeaderCellDef> Venda (Data) </th>
            <td mat-cell *matCellDef="let element"> 
              #{{ element.venda?.numero || 'Avulso' }}<br>
              <small style="color: var(--nexa-text-muted)">{{ element.venda?.dataVenda | date:'dd/MM/yyyy' }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="vencimento">
            <th mat-header-cell *matHeaderCellDef> Vencimento </th>
            <td mat-cell *matCellDef="let element"> {{ element.dataVencimento | date:'dd/MM/yyyy' }} </td>
          </ng-container>

          <ng-container matColumnDef="valor">
            <th mat-header-cell *matHeaderCellDef> Valor </th>
            <td mat-cell *matCellDef="let element"> 
              {{ (element.valor - element.valorPago) | currency:'BRL' }} 
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element">
              <mat-chip-set>
                <mat-chip [color]="element.status === 'ATRASADO' ? 'warn' : 'accent'" highlighted>
                  {{ element.status }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef> Ações </th>
            <td mat-cell *matCellDef="let element">
              <button mat-flat-button color="primary" size="small" (click)="baixarConta(element.id)">
                Receber
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        @if (contas().length === 0) {
          <div style="padding: 24px; text-align: center; color: var(--nexa-text-muted);">
            Nenhum título em aberto.
          </div>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `
})
export class FiadosDetalhesDialogComponent implements OnInit {
  loading = signal(true);
  contas = signal<any[]>([]);
  displayedColumns = ['venda', 'vencimento', 'valor', 'status', 'acoes'];

  constructor(
    public dialogRef: MatDialogRef<FiadosDetalhesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cliente: any },
    private fiadosService: FiadosService,
    private snackBar: MatSnackBar,
    private confirmService: ConfirmDialogService,
  ) {}

  ngOnInit() {
    this.carregarDetalhes();
  }

  carregarDetalhes() {
    this.loading.set(true);
    this.fiadosService.getDetalhes(this.data.cliente.id).subscribe({
      next: (res) => {
        this.contas.set(res.data || res);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao carregar detalhes', 'X', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  baixarConta(id: number) {
    this.confirmService.confirm({
      title: 'Confirmar Recebimento',
      message: 'Confirma o recebimento integral deste título no fiado?',
      confirmText: 'Confirmar',
      isDanger: false,
    }).subscribe(res => {
      if (res) {
        this.fiadosService.baixarConta(id).subscribe({
          next: () => {
            this.snackBar.open('Baixa realizada com sucesso!', 'OK', { duration: 3000 });
            this.carregarDetalhes();
          },
          error: () => {
            this.snackBar.open('Erro ao realizar a baixa', 'X', { duration: 3000 });
          }
        });
      }
    });
  }
}
