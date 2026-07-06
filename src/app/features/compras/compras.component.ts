import { NexaSelectComponent } from '../../shared/components/nexa-select/nexa-select.component';
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComprasService, Compra } from './services/compras.service';
import { CompraDialogComponent } from './dialogs/compra-dialog.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [NexaSelectComponent, 
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './compras.component.html',
})
export class ComprasComponent implements OnInit {
  readonly compras = signal<Compra[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<string | null>(null);
  readonly loading = signal(false);
  readonly displayedColumns = ['numero', 'fornecedor', 'dataCompra', 'valorTotal', 'formaPagamento', 'status', 'acoes'];
  private searchSubject = new Subject<string>();

  constructor(
    private comprasService: ComprasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmService: ConfirmDialogService
  ) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadData();
    });
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.comprasService.findAll(
      this.currentPage(), this.pageSize(),
      this.searchTerm() || undefined, this.selectedStatus() ?? undefined,
    ).subscribe({
      next: (res) => {
        this.compras.set(res.data);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar compras', 'Fechar', { duration: 3000 });
      },
    });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onStatusChange(status: string | null): void { this.selectedStatus.set(status); this.currentPage.set(1); this.loadData(); }
  onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex + 1); this.pageSize.set(event.pageSize); this.loadData(); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      RASCUNHO: 'status-rascunho', CONFIRMADA: 'status-confirmada',
      FATURADA: 'status-faturada', CANCELADA: 'status-cancelada',
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      RASCUNHO: 'Rascunho', CONFIRMADA: 'Confirmada',
      FATURADA: 'Faturada', CANCELADA: 'Cancelada',
    };
    return map[status] || status;
  }

  getFormaPagamentoLabel(fp: string): string {
    const map: Record<string, string> = {
      DINHEIRO: 'Dinheiro', PIX: 'PIX', CARTAO_CREDITO: 'Cartão Crédito',
      CARTAO_DEBITO: 'Cartão Débito', BOLETO: 'Boleto', TRANSFERENCIA: 'Transferência',
    };
    return map[fp] || fp;
  }

  openDialog(compra?: Compra): void {
    if (compra) {
      this.loading.set(true);
      this.comprasService.findOne(compra.id).subscribe({
        next: (res) => { this.loading.set(false); this.openCompraDialog(res); },
        error: () => { this.loading.set(false); this.snackBar.open('Erro ao carregar detalhes', 'Fechar', { duration: 3000 }); },
      });
    } else {
      this.openCompraDialog();
    }
  }

  private openCompraDialog(compra?: Compra): void {
    const ref = this.dialog.open(CompraDialogComponent, { data: { compra }, width: '900px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = compra ? this.comprasService.update(compra.id, result) : this.comprasService.create(result);
      obs.subscribe({
        next: () => {
          this.snackBar.open(compra ? 'Compra atualizada!' : 'Compra criada!', 'OK', { duration: 3000 });
          this.loadData();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onConfirmar(compra: Compra): void {
    const nome = compra.fornecedor?.nome || 'Fornecedor Desconhecido';
    this.confirmService.confirm({
      title: 'Confirmar Recebimento',
      message: `Confirmar recebimento da compra de "${nome}"? O estoque dos produtos será adicionado.`,
      confirmText: 'Confirmar'
    }).subscribe(res => {
      if (res) {
        this.comprasService.updateStatus(compra.id, 'CONFIRMADA').subscribe({
          next: () => { this.snackBar.open('Compra confirmada! Estoque adicionado.', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao confirmar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onFaturar(compra: Compra): void {
    this.confirmService.confirm({
      title: 'Faturar Compra',
      message: `Faturar compra #${compra.numero}?`,
      confirmText: 'Faturar'
    }).subscribe(res => {
      if (res) {
        this.comprasService.updateStatus(compra.id, 'FATURADA').subscribe({
          next: () => { this.snackBar.open('Compra faturada com sucesso!', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao faturar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onCancelar(compra: Compra): void {
    this.confirmService.confirm({
      title: 'Cancelar Compra',
      message: `Cancelar compra #${compra.numero}? O estoque adicionado será subtraído/estornado.`,
      isDanger: true,
      confirmText: 'Cancelar Compra'
    }).subscribe(res => {
      if (res) {
        this.comprasService.updateStatus(compra.id, 'CANCELADA').subscribe({
          next: () => { this.snackBar.open('Compra cancelada. Estoque estornado.', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao cancelar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onRemove(compra: Compra): void {
    const nome = compra.fornecedor?.nome || 'Fornecedor Desconhecido';
    this.confirmService.confirm({
      title: 'Excluir Rascunho',
      message: `Excluir rascunho da compra de "${nome}"?`,
      isDanger: true,
      confirmText: 'Excluir'
    }).subscribe(res => {
      if (res) {
        this.comprasService.remove(compra.id).subscribe({
          next: () => { this.snackBar.open('Compra excluída', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }
}
