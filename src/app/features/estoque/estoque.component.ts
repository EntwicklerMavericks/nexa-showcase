import { NexaSelectComponent } from '../../shared/components/nexa-select/nexa-select.component';
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EstoqueService, AlertaEstoque, EstoqueHistorico, RelatorioReposicaoItem } from './services/estoque.service';
import { ProdutosService, Produto } from '../produtos/services/produtos.service';
import { CategoriasService, Categoria } from '../categorias/services/categorias.service';
import { FornecedoresService, Fornecedor } from '../fornecedores/services/fornecedores.service';
import { ComprasService } from '../compras/services/compras.service';
import { MovimentacaoDialogComponent } from './dialogs/movimentacao-dialog.component';
import { MenuNotificationService } from '../../core/layout/services/menu-notification.service';
import { AuthService } from '../../core/auth/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [NexaSelectComponent, 
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './estoque.component.html',
})
export class EstoqueComponent implements OnInit {
  // Alerts state
  readonly alertas = signal<AlertaEstoque[]>([]);

  // Complete inventory products list state
  readonly produtos = signal<Produto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly searchTerm = signal('');
  readonly selectedCategoria = signal<number | null>(null);
  readonly loading = signal(false);

  // Active view tab
  readonly activeTab = signal<'inventory' | 'reposicao'>('inventory');

  // Replenishment report state
  readonly reposicaoItens = signal<RelatorioReposicaoItem[]>([]);
  readonly loadingReposicao = signal(false);
  readonly selectedFornecedorId = signal<number | null>(null);
  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly selectAllChecked = signal(false);

  // Selected product history logs state
  readonly selectedProdutoId = signal<number | null>(null);
  readonly selectedProdutoNome = signal<string>('');
  readonly historico = signal<EstoqueHistorico[]>([]);
  readonly histTotal = signal(0);
  readonly histCols = ['createdAt', 'tipo', 'quantidade', 'movimento', 'motivo'];

  // Table columns for complete inventory overview
  readonly productCols = ['sku', 'nome', 'categoria', 'estoqueMinimo', 'estoqueAtual', 'status', 'acoes'];

  private searchSubject = new Subject<string>();

  constructor(
    private estoqueService: EstoqueService,
    private produtosService: ProdutosService,
    private categoriasService: CategoriasService,
    private fornecedoresService: FornecedoresService,
    private comprasService: ComprasService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private menuNotificationService: MenuNotificationService,
    private authService: AuthService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadProdutos();
    });
  }

  readonly hasFornecedores = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    const plan = (user.plano || 'STARTER').toUpperCase();
    return plan === 'PRO' || plan === 'PREMIUM';
  });

  ngOnInit(): void {
    this.loadAlertas();
    this.loadCategorias();
    this.loadProdutos();
    if (this.hasFornecedores()) {
      this.loadFornecedores();
    }
    this.loadReplenishmentReport();
  }

  loadAlertas(): void {
    this.estoqueService.getAlertas().subscribe({
      next: (res) => {
        const list = res || [];
        this.alertas.set(list);
        this.menuNotificationService.setCount('Estoque', list.length);
      },
    });
  }

  loadCategorias(): void {
    this.categoriasService.findAll(1, 100).subscribe({
      next: (res) => this.categorias.set(res.data || []),
    });
  }

  loadProdutos(): void {
    this.loading.set(true);
    this.produtosService.findAll(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm() || undefined,
      this.selectedCategoria() ?? undefined
    ).subscribe({
      next: (res) => {
        this.produtos.set(res.data || []);
        this.totalRecords.set(res.meta.total || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar lista de estoque', 'Fechar', { duration: 3000 });
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onCategoriaChange(id: number | null): void {
    this.selectedCategoria.set(id);
    this.currentPage.set(1);
    this.loadProdutos();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadProdutos();
  }

  openMovimentacao(produtoId: number, produtoNome: string): void {
    const ref = this.dialog.open(MovimentacaoDialogComponent, {
      data: { produtoId, produtoNome },
      width: '480px'
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.estoqueService.movimentar(result).subscribe({
        next: () => {
          this.snackBar.open('Estoque atualizado com sucesso!', 'OK', { duration: 3000 });
          this.loadAlertas();
          this.loadProdutos();
          if (this.selectedProdutoId() === produtoId) {
            this.loadHistorico(produtoId);
          }
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro na movimentação', 'Fechar', { duration: 3000 }),
      });
    });
  }

  toggleHistorico(produtoId: number, produtoNome: string): void {
    if (this.selectedProdutoId() === produtoId) {
      // Toggle off if clicking the same item
      this.selectedProdutoId.set(null);
      this.selectedProdutoNome.set('');
      this.historico.set([]);
      this.histTotal.set(0);
    } else {
      // Load selected product history
      this.selectedProdutoId.set(produtoId);
      this.selectedProdutoNome.set(produtoNome);
      this.loadHistorico(produtoId);
    }
  }

  loadHistorico(produtoId: number, page = 1): void {
    this.estoqueService.getHistorico(produtoId, page, 10).subscribe({
      next: (res) => {
        this.historico.set(res.data || []);
        this.histTotal.set(res.meta?.total || 0);
      },
    });
  }

  onHistPage(event: PageEvent): void {
    if (this.selectedProdutoId()) {
      this.loadHistorico(this.selectedProdutoId()!, event.pageIndex + 1);
    }
  }

  readonly selectedItemsCount = computed(() => {
    return this.reposicaoItens().filter((i) => i.selected).length;
  });

  loadFornecedores(): void {
    this.fornecedoresService.findAll(1, 100).subscribe({
      next: (res) => this.fornecedores.set(res.data || []),
    });
  }

  loadReplenishmentReport(): void {
    this.loadingReposicao.set(true);
    this.estoqueService.getRelatorioReposicao().subscribe({
      next: (res) => {
        const items = (res || []).map((item: any) => ({
          ...item,
          selected: false,
          quantidadeAComprar: item.sugestaoRepor
        }));
        this.reposicaoItens.set(items);
        this.loadingReposicao.set(false);
        this.selectAllChecked.set(false);
      },
      error: () => {
        this.loadingReposicao.set(false);
        this.snackBar.open('Erro ao carregar relatório de reposição', 'Fechar', { duration: 3000 });
      }
    });
  }

  toggleSelectAll(checked: boolean): void {
    this.selectAllChecked.set(checked);
    this.reposicaoItens.update((items) =>
      items.map((item) => ({ ...item, selected: checked }))
    );
  }

  onItemSelectionChange(): void {
    const items = this.reposicaoItens();
    const allSelected = items.length > 0 && items.every((i) => i.selected);
    this.selectAllChecked.set(allSelected);
    this.reposicaoItens.set([...items]); // Force signal notification for in-place mutation
  }

  gerarCompra(): void {
    const selected = this.reposicaoItens().filter((i) => i.selected);
    if (selected.length === 0) {
      this.snackBar.open('Selecione pelo menos um item para repor', 'OK', { duration: 3000 });
      return;
    }

    const fornecedorId = this.selectedFornecedorId();
    if (!fornecedorId) {
      this.snackBar.open('Selecione um fornecedor para criar o pedido de compra', 'OK', { duration: 3000 });
      return;
    }

    const payload = {
      fornecedorId,
      formaPagamento: 'BOLETO',
      parcelas: 1,
      itens: selected.map((i) => ({
        produtoId: i.produtoId,
        quantidade: i.quantidadeAComprar || i.sugestaoRepor,
        valorUnitario: i.ultimoPrecoCompra || 0,
      })),
    };

    this.snackBar.open('Gerando pedido de compra...', '', { duration: 1000 });

    this.comprasService.create(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Pedido de Compra gerado em Rascunho com sucesso!', 'Ir para Compras', { duration: 5000 })
          .onAction().subscribe(() => {
            this.router.navigate(['/compras']);
          });
        this.loadReplenishmentReport();
        this.loadAlertas();
        this.loadProdutos();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao gerar pedido de compra', 'Fechar', { duration: 4000 });
      }
    });
  }
}
