import { NexaSelectComponent } from '../../shared/components/nexa-select/nexa-select.component';
import { Component, signal, computed, OnInit } from '@angular/core';
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
import { VendasService, Venda } from './services/vendas.service';
import { VendaDialogComponent } from './dialogs/venda-dialog.component';
import { Produto, ProdutosService } from '../produtos/services/produtos.service';
import { EmpresasService } from '../empresas/services/empresas.service';
import { EntregaDialogComponent } from '../logistica/dialogs/entrega-dialog.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SyncService } from '../../core/offline/sync/sync.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { AuthService } from '../../core/auth/auth.service';
import { PrintService } from '../../shared/services/print.service';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDialogModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './vendas.component.html',
  styles: [`
    @media (max-width: 600px) {
      .shortcut-suffix {
        display: none !important;
      }
    }
  `]
})
export class VendasComponent implements OnInit {
  readonly vendas = signal<Venda[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<string | null>(null);
  readonly loading = signal(false);
  readonly displayedColumns = ['numero', 'cliente', 'dataVenda', 'valorTotal', 'formaPagamento', 'status', 'acoes'];
  private searchSubject = new Subject<string>();

  // Scanner rápido na listagem
  quickScanBarcode = '';

  constructor(
    private vendasService: VendasService,
    private produtosService: ProdutosService,
    private empresasService: EmpresasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public syncService: SyncService,
    private confirmService: ConfirmDialogService,
    private authService: AuthService,
    private printService: PrintService,
  ) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadData();
    });
  }

  readonly hasProFeatures = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const plan = (user.plano || 'STARTER').toUpperCase();
    return plan === 'PRO' || plan === 'PREMIUM';
  });

  ngOnInit(): void { 
    this.loadData(); 
    this.syncService.updatePendingCount();
  }

  async syncCatalog() {
    try {
      await this.syncService.downloadCatalog();
      this.snackBar.open('Catálogo sincronizado com sucesso!', 'OK', { duration: 3000 });
    } catch (e: any) {
      this.snackBar.open(e.message || 'Erro ao sincronizar catálogo', 'Fechar', { duration: 3000 });
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.vendasService.findAll(
      this.currentPage(), this.pageSize(),
      this.searchTerm() || undefined, this.selectedStatus() ?? undefined,
    ).subscribe({
      next: (res) => {
        this.vendas.set(res.data);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.snackBar.open('Erro ao carregar vendas', 'Fechar', { duration: 3000 }); },
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

  onQuickBarcodeScan(event: Event): void {
    event.preventDefault();
    const term = this.quickScanBarcode?.trim();
    if (!term) return;

    this.loading.set(true);
    // Busca produto local ou remoto pelo SKU ou Código de barras
    this.produtosService.findAll(1, 10, term).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        const prod = res.data?.find((p: any) => p.sku === term || p.codigoBarras === term);

        if (prod) {
          this.quickScanBarcode = '';
          // Abre o PDV já com o produto inserido
          this.openDialog(undefined, prod);
        } else {
          this.snackBar.open(`Produto com Código/SKU "${term}" não encontrado!`, 'Fechar', { duration: 3000 });
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao buscar produto para bipe rápido', 'Fechar', { duration: 3000 });
      }
    });
  }

  openDialog(venda?: Venda, preScannedProduct?: Produto): void {
    if (venda) {
      this.loading.set(true);
      this.vendasService.findOne(venda.id).subscribe({
        next: (res) => { this.loading.set(false); this.openVendaDialog(res); },
        error: () => { this.loading.set(false); this.snackBar.open('Erro ao carregar detalhes', 'Fechar', { duration: 3000 }); },
      });
    } else {
      this.openVendaDialog(undefined, preScannedProduct);
    }
  }

  private openVendaDialog(venda?: Venda, preScannedProduct?: Produto): void {
    const isMobile = window.innerWidth <= 768;
    const ref = this.dialog.open(VendaDialogComponent, { 
      data: { venda, preScannedProduct }, 
      width: isMobile ? '100vw' : '1200px', 
      maxWidth: isMobile ? '100vw' : '95vw',
      height: isMobile ? '100dvh' : 'auto',
      maxHeight: isMobile ? '100dvh' : '95vh',
      panelClass: isMobile ? 'pdv-mobile-dialog' : ''
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = venda ? this.vendasService.update(venda.id, result) : this.vendasService.create(result);
      obs.subscribe({
        next: (savedVenda: any) => {
          // Automatically confirm the sale to deduct stock without an extra step
          this.vendasService.updateStatus(savedVenda.id, 'CONFIRMADA').subscribe({
            next: () => {
              this.snackBar.open(venda ? 'Venda atualizada e confirmada!' : 'Venda criada e confirmada!', 'OK', { duration: 3000 });
              this.loadData();
              if (!venda && savedVenda && savedVenda.id) {
                this.onImprimirCupom(savedVenda);
              }
            },
            error: (err) => {
              this.snackBar.open(err.error?.message || 'Venda salva como rascunho, erro ao confirmar e deduzir estoque', 'Fechar', { duration: 4000 });
              this.loadData();
            }
          });
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onConfirmar(venda: Venda): void {
    const nome = venda.cliente?.nome || 'Consumidor Final';
    this.confirmService.confirm({
      title: 'Confirmar Venda',
      message: `Confirmar venda para "${nome}"? O estoque será deduzido.`,
      confirmText: 'Confirmar'
    }).subscribe(res => {
      if (res) {
        this.vendasService.updateStatus(venda.id, 'CONFIRMADA').subscribe({
          next: () => { 
            this.snackBar.open('Venda confirmada! Estoque deduzido.', 'OK', { duration: 3000 }); 
            this.loadData(); 
            this.onImprimirCupom(venda); // Auto-imprimir
          },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao confirmar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onFaturar(venda: Venda): void {
    const message = this.hasProFeatures() 
      ? `Faturar venda #${venda.numero}?`
      : `Faturar venda #${venda.numero}? (Sua conta não possui emissão de NF-e)`;

    this.confirmService.confirm({
      title: 'Faturar Venda',
      message,
      confirmText: 'Faturar'
    }).subscribe(res => {
      if (res) {
        this.vendasService.updateStatus(venda.id, 'FATURADA').subscribe({
          next: () => { 
            this.snackBar.open('Venda faturada com sucesso!', 'OK', { duration: 3000 }); 
            this.loadData(); 
          },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao faturar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onCancelar(venda: Venda): void {
    this.confirmService.confirm({
      title: 'Cancelar Venda',
      message: `Cancelar venda #${venda.numero}? O estoque será estornado.`,
      isDanger: true,
      confirmText: 'Cancelar Venda'
    }).subscribe(res => {
      if (res) {
        this.vendasService.updateStatus(venda.id, 'CANCELADA').subscribe({
          next: () => { this.snackBar.open('Venda cancelada. Estoque estornado.', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao cancelar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onRemove(venda: Venda): void {
    const nome = venda.cliente?.nome || 'Consumidor Final';
    this.confirmService.confirm({
      title: 'Excluir Venda',
      message: `Excluir rascunho da venda para "${nome}"?`,
      isDanger: true,
      confirmText: 'Excluir'
    }).subscribe(res => {
      if (res) {
        this.vendasService.remove(venda.id).subscribe({
          next: () => { this.snackBar.open('Venda excluída', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onImprimirCupom(venda: Venda): void {
    // Open the window synchronously to bypass browser popup blockers
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      this.snackBar.open('Pop-up bloqueado! Permita popups para imprimir.', 'OK', { duration: 5000 });
      return;
    }
    printWindow.document.write('<html><body><h3>Gerando cupom, aguarde...</h3></body></html>');

    this.vendasService.findOne(venda.id).subscribe({
      next: (fullVenda) => {
        this.empresasService.findOne(fullVenda.empresaId).subscribe({
          next: (empresa) => {
            this.printService.printVendaCupom(fullVenda, empresa, printWindow);
          },
          error: () => {
            this.printService.printVendaCupom(fullVenda, null, printWindow);
          }
        });
      },
      error: () => {
        printWindow.close();
        this.snackBar.open('Erro ao carregar detalhes da venda para impressão', 'Fechar', { duration: 3000 });
      }
    });
  }

  onAgendarEntrega(venda: Venda): void {
    const ref = this.dialog.open(EntregaDialogComponent, {
      data: {
        vendaId: venda.id,
        clienteNome: venda.cliente?.nome,
        endereco: venda.cliente?.endereco,
        cidade: venda.cliente?.cidade,
        estado: venda.cliente?.estado,
        cep: venda.cliente?.cep,
      },
      width: '500px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }
}
