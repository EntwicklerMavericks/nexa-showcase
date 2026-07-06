import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FiadosService, FiadoResumo, PaginatedFiados } from './services/fiados.service';
import { FiadosDetalhesDialogComponent } from './dialogs/fiados-detalhes-dialog.component';

@Component({
  selector: 'app-fiados-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    CurrencyPipe
  ],
  template: `
    <div class="page-container nexa-fade-in">
      <div class="page-header">
        <div class="header-title">
          <mat-icon class="header-icon">book</mat-icon>
          <div>
            <h1>Fiados / Caderneta</h1>
            <p>Gerencie o saldo devedor dos seus clientes no crediário.</p>
          </div>
        </div>
      </div>

      <mat-card class="nexa-card">
        <div class="card-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar por cliente, CPF ou CNPJ" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="onSearch()" style="margin-left: 16px; height: 56px;">
            Buscar
          </button>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="fiados()">
            
            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef> Cliente </th>
              <td mat-cell *matCellDef="let row">
                <strong>{{ row.cliente.nome }}</strong><br>
                <small style="color: var(--nexa-text-muted)">{{ row.cliente.cpfCnpj }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="telefone">
              <th mat-header-cell *matHeaderCellDef> Telefone </th>
              <td mat-cell *matCellDef="let row">
                {{ row.cliente.telefone || 'Não informado' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="titulos">
              <th mat-header-cell *matHeaderCellDef> Títulos (Qtd) </th>
              <td mat-cell *matCellDef="let row">
                {{ row.quantidadeTitulos }} 
                <span *ngIf="row.titulosAtrasados > 0" style="color: #f44336; font-size: 0.8rem; margin-left: 4px;">
                  ({{ row.titulosAtrasados }} atrasados)
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="saldo">
              <th mat-header-cell *matHeaderCellDef> Saldo Devedor </th>
              <td mat-cell *matCellDef="let row">
                <span style="font-weight: 600;">{{ row.saldoDevedorTotal | currency:'BRL' }}</span><br>
                <small *ngIf="row.saldoAtrasado > 0" style="color: #f44336">
                  {{ row.saldoAtrasado | currency:'BRL' }} em atraso
                </small>
              </td>
            </ng-container>

            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef align="end"> Ações </th>
              <td mat-cell *matCellDef="let row" align="end">
                <button mat-icon-button color="primary" matTooltip="Ver Detalhes" (click)="abrirDetalhes(row)">
                  <mat-icon>list_alt</mat-icon>
                </button>
                <button mat-icon-button style="color: #25D366" matTooltip="Cobrar no WhatsApp" (click)="cobrarWhatsapp(row)">
                  <mat-icon>chat</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="5" style="text-align: center; padding: 32px;">
                @if (loading()) {
                  Buscando dados...
                } @else {
                  Nenhum cliente com fiado em aberto encontrado.
                }
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalItems()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .table-container { overflow-x: auto; }
    .card-toolbar {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--nexa-border);
    }
    .search-field { flex: 1; max-width: 400px; }
    ::ng-deep .search-field .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class FiadosListaComponent implements OnInit {
  displayedColumns: string[] = ['cliente', 'telefone', 'titulos', 'saldo', 'acoes'];
  fiados = signal<FiadoResumo[]>([]);
  totalItems = signal(0);
  pageSize = signal(20);
  pageIndex = signal(0);
  loading = signal(false);
  searchQuery = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fiadosService: FiadosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.carregarFiados();
  }

  carregarFiados() {
    this.loading.set(true);
    this.fiadosService.getResumo(this.pageIndex() + 1, this.pageSize(), this.searchQuery)
      .subscribe({
        next: (res: PaginatedFiados) => {
          this.fiados.set(res.data);
          this.totalItems.set(res.meta.total);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erro ao carregar lista de fiados', 'Fechar', { duration: 3000 });
          this.loading.set(false);
        }
      });
  }

  onSearch() {
    this.pageIndex.set(0);
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.carregarFiados();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.carregarFiados();
  }

  abrirDetalhes(row: FiadoResumo) {
    const dialogRef = this.dialog.open(FiadosDetalhesDialogComponent, {
      width: '800px',
      data: { cliente: row.cliente }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recarregar os dados para atualizar os saldos caso tenham baixado contas
      this.carregarFiados();
    });
  }

  cobrarWhatsapp(row: FiadoResumo) {
    if (!row.cliente.telefone) {
      this.snackBar.open('O cliente não possui telefone cadastrado.', 'X', { duration: 3000 });
      return;
    }

    const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const saldo = formatter.format(row.saldoDevedorTotal);
    
    const texto = `Olá *${row.cliente.nome}*, tudo bem?
Aqui é do nosso sistema de crediário. Gostaríamos de lembrar que você possui um saldo em aberto na sua caderneta no valor de *${saldo}*.
Podemos ajudar com algo para a quitação desse valor? Agradecemos a preferência!`;

    const telefoneLimpo = row.cliente.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
  }
}
