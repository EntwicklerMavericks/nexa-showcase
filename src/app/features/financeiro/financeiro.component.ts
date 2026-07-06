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
import { MatTabsModule } from '@angular/material/tabs';
import { FinanceiroService } from './services/financeiro.service';
import { LancamentoDialogComponent } from './dialogs/lancamento-dialog.component';
import { BaixaDialogComponent } from './dialogs/baixa-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-financeiro',
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
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './financeiro.component.html',
})
export class FinanceiroComponent implements OnInit {
  // ── Aba ativa ──────────────────────────────────────────────────────────────
  readonly activeTab = signal(0);

  // ── Dashboard ──────────────────────────────────────────────────────────────
  readonly dashboard = signal<any>(null);
  readonly proximosVencimentos = signal<any[]>([]);
  readonly loadingDashboard = signal(false);
  readonly displayedColumnsVencimentos = ['tipo', 'descricao', 'entidade', 'valor', 'vencimento', 'status'];

  // ── Contas a Receber ───────────────────────────────────────────────────────
  readonly contasReceber = signal<any[]>([]);
  readonly totalReceber = signal(0);
  readonly pageReceber = signal(1);
  readonly pageSizeReceber = signal(20);
  readonly searchReceber = signal('');
  readonly statusReceber = signal<string | null>(null);
  readonly dataInicioReceber = signal('');
  readonly dataFimReceber = signal('');
  readonly loadingReceber = signal(false);
  readonly displayedColumnsReceber = ['descricao', 'cliente', 'parcela', 'valor', 'vencimento', 'status', 'acoes'];
  private searchReceberSubject = new Subject<string>();

  // ── Contas a Pagar ─────────────────────────────────────────────────────────
  readonly contasPagar = signal<any[]>([]);
  readonly totalPagar = signal(0);
  readonly pagePagar = signal(1);
  readonly pageSizePagar = signal(20);
  readonly searchPagar = signal('');
  readonly statusPagar = signal<string | null>(null);
  readonly dataInicioPagar = signal('');
  readonly dataFimPagar = signal('');
  readonly loadingPagar = signal(false);
  readonly displayedColumnsPagar = ['descricao', 'fornecedor', 'parcela', 'valor', 'vencimento', 'status', 'acoes'];
  private searchPagarSubject = new Subject<string>();

  constructor(
    private financeiroService: FinanceiroService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmService: ConfirmDialogService,
  ) {
    this.searchReceberSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchReceber.set(term);
      this.pageReceber.set(1);
      this.loadReceber();
    });
    this.searchPagarSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchPagar.set(term);
      this.pagePagar.set(1);
      this.loadPagar();
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ── Troca de aba ───────────────────────────────────────────────────────────
  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 0) this.loadDashboard();
    else if (index === 1) this.loadReceber();
    else if (index === 2) this.loadPagar();
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  loadDashboard(): void {
    this.loadingDashboard.set(true);
    this.financeiroService.getDashboard().subscribe({
      next: (res) => {
        this.dashboard.set(res);
        this.proximosVencimentos.set(res.proximosVencimentos || []);
        this.loadingDashboard.set(false);
      },
      error: () => {
        this.loadingDashboard.set(false);
        this.snackBar.open('Erro ao carregar dashboard financeiro', 'Fechar', { duration: 3000 });
      },
    });
  }

  // ── Contas a Receber ───────────────────────────────────────────────────────
  loadReceber(): void {
    this.loadingReceber.set(true);
    this.financeiroService.getContasReceber(
      this.pageReceber(), this.pageSizeReceber(),
      this.statusReceber() ?? undefined,
      this.dataInicioReceber() || undefined,
      this.dataFimReceber() || undefined,
    ).subscribe({
      next: (res) => {
        this.contasReceber.set(res.data);
        this.totalReceber.set(res.meta.total);
        this.loadingReceber.set(false);
      },
      error: () => {
        this.loadingReceber.set(false);
        this.snackBar.open('Erro ao carregar contas a receber', 'Fechar', { duration: 3000 });
      },
    });
  }

  onSearchReceberChange(term: string): void { this.searchReceberSubject.next(term); }
  onStatusReceberChange(status: string | null): void { this.statusReceber.set(status); this.pageReceber.set(1); this.loadReceber(); }
  onDataInicioReceberChange(val: string): void { this.dataInicioReceber.set(val); this.pageReceber.set(1); this.loadReceber(); }
  onDataFimReceberChange(val: string): void { this.dataFimReceber.set(val); this.pageReceber.set(1); this.loadReceber(); }
  onPageReceberChange(event: PageEvent): void { this.pageReceber.set(event.pageIndex + 1); this.pageSizeReceber.set(event.pageSize); this.loadReceber(); }

  // ── Contas a Pagar ─────────────────────────────────────────────────────────
  loadPagar(): void {
    this.loadingPagar.set(true);
    this.financeiroService.getContasPagar(
      this.pagePagar(), this.pageSizePagar(),
      this.statusPagar() ?? undefined,
      this.dataInicioPagar() || undefined,
      this.dataFimPagar() || undefined,
    ).subscribe({
      next: (res) => {
        this.contasPagar.set(res.data);
        this.totalPagar.set(res.meta.total);
        this.loadingPagar.set(false);
      },
      error: () => {
        this.loadingPagar.set(false);
        this.snackBar.open('Erro ao carregar contas a pagar', 'Fechar', { duration: 3000 });
      },
    });
  }

  onSearchPagarChange(term: string): void { this.searchPagarSubject.next(term); }
  onStatusPagarChange(status: string | null): void { this.statusPagar.set(status); this.pagePagar.set(1); this.loadPagar(); }
  onDataInicioPagarChange(val: string): void { this.dataInicioPagar.set(val); this.pagePagar.set(1); this.loadPagar(); }
  onDataFimPagarChange(val: string): void { this.dataFimPagar.set(val); this.pagePagar.set(1); this.loadPagar(); }
  onPagePagarChange(event: PageEvent): void { this.pagePagar.set(event.pageIndex + 1); this.pageSizePagar.set(event.pageSize); this.loadPagar(); }

  // ── Helpers de status ──────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDENTE: 'status-pendente', PAGO: 'status-pago', RECEBIDO: 'status-pago',
      ATRASADO: 'status-atrasado', CANCELADO: 'status-cancelado',
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDENTE: 'Pendente', PAGO: 'Pago', RECEBIDO: 'Recebido',
      ATRASADO: 'Atrasado', CANCELADO: 'Cancelado',
    };
    return map[status] || status;
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'RECEBER' ? 'Receber' : 'Pagar';
  }

  getTipoClass(tipo: string): string {
    return tipo === 'RECEBER' ? 'tipo-receber' : 'tipo-pagar';
  }

  // ── Ações — Contas a Receber ───────────────────────────────────────────────
  openNovoReceber(): void {
    const ref = this.dialog.open(LancamentoDialogComponent, {
      data: { tipo: 'receber' }, width: '600px', maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.financeiroService.createContaReceber(result).subscribe({
        next: () => { this.snackBar.open('Lançamento a receber criado!', 'OK', { duration: 3000 }); this.loadReceber(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao criar lançamento', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onBaixarReceber(titulo: any): void {
    const ref = this.dialog.open(BaixaDialogComponent, {
      data: { titulo }, width: '500px', maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.financeiroService.baixarReceber(titulo.id, result).subscribe({
        next: () => { this.snackBar.open('Título baixado com sucesso!', 'OK', { duration: 3000 }); this.loadReceber(); this.loadDashboard(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao baixar título', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onEstornarReceber(titulo: any): void {
    this.confirmService.confirm({
      title: 'Estornar Recebimento',
      message: `Estornar recebimento de "${titulo.descricao}"? O título voltará para PENDENTE.`,
      confirmText: 'Estornar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.financeiroService.estornarReceber(titulo.id).subscribe({
          next: () => { this.snackBar.open('Recebimento estornado!', 'OK', { duration: 3000 }); this.loadReceber(); this.loadDashboard(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao estornar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onRemoveReceber(titulo: any): void {
    this.confirmService.confirm({
      title: 'Excluir Lançamento',
      message: `Excluir lançamento "${titulo.descricao}"?`,
      confirmText: 'Excluir',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.financeiroService.removeReceber(titulo.id).subscribe({
          next: () => { this.snackBar.open('Lançamento excluído!', 'OK', { duration: 3000 }); this.loadReceber(); this.loadDashboard(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  // ── Ações — Contas a Pagar ─────────────────────────────────────────────────
  openNovoPagar(): void {
    const ref = this.dialog.open(LancamentoDialogComponent, {
      data: { tipo: 'pagar' }, width: '600px', maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.financeiroService.createContaPagar(result).subscribe({
        next: () => { this.snackBar.open('Lançamento a pagar criado!', 'OK', { duration: 3000 }); this.loadPagar(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao criar lançamento', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onBaixarPagar(titulo: any): void {
    const ref = this.dialog.open(BaixaDialogComponent, {
      data: { titulo }, width: '500px', maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.financeiroService.baixarPagar(titulo.id, result).subscribe({
        next: () => { this.snackBar.open('Pagamento registrado com sucesso!', 'OK', { duration: 3000 }); this.loadPagar(); this.loadDashboard(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao registrar pagamento', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onEstornarPagar(titulo: any): void {
    this.confirmService.confirm({
      title: 'Estornar Pagamento',
      message: `Estornar pagamento de "${titulo.descricao}"? O título voltará para PENDENTE.`,
      confirmText: 'Estornar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.financeiroService.estornarPagar(titulo.id).subscribe({
          next: () => { this.snackBar.open('Pagamento estornado!', 'OK', { duration: 3000 }); this.loadPagar(); this.loadDashboard(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao estornar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onRemovePagar(titulo: any): void {
    this.confirmService.confirm({
      title: 'Excluir Lançamento',
      message: `Excluir lançamento "${titulo.descricao}"?`,
      confirmText: 'Excluir',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.financeiroService.removePagar(titulo.id).subscribe({
          next: () => { this.snackBar.open('Lançamento excluído!', 'OK', { duration: 3000 }); this.loadPagar(); this.loadDashboard(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }
}
