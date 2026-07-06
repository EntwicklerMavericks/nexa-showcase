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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProdutosService, Produto } from './services/produtos.service';
import { CategoriasService, Categoria } from '../categorias/services/categorias.service';
import { ProdutoDialogComponent } from './dialogs/produto-dialog.component';
import { EtiquetaDialogComponent } from './dialogs/etiqueta-dialog.component';
import { ImportarDialogComponent } from '../../shared/dialogs/importar-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { environment } from '../../../environments/environment';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { NexaDataTableComponent, ColumnConfig, NexaCustomCellDirective } from '../../shared/components/data-table/nexa-data-table.component';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatChipsModule, MatDialogModule, MatTooltipModule, MatSnackBarModule, NexaDataTableComponent, NexaCustomCellDirective],
  templateUrl: './produtos.component.html',
})
export class ProdutosComponent implements OnInit {
  readonly produtos = signal<Produto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly selectedCategoria = signal<number | null>(null);
  readonly loading = signal(false);

  readonly columns: ColumnConfig[] = [
    { key: 'sku', label: 'SKU' },
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria', hideOnMobile: true },
    { key: 'precoCusto', label: 'Custo', hideOnMobile: true },
    { key: 'precoVenda', label: 'Venda' },
    { key: 'margem', label: 'Margem', hideOnMobile: true },
    { key: 'estoque', label: 'Estoque' },
    { key: 'status', label: 'Status' },
    { key: 'acoes', label: 'Ações' }
  ];
  private searchSubject = new Subject<string>();

  constructor(private produtosService: ProdutosService, private categoriasService: CategoriasService, private dialog: MatDialog, private snackBar: MatSnackBar, private confirmService: ConfirmDialogService) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term); this.currentPage.set(1); this.loadData();
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.categoriasService.findAll(1, 100).subscribe({ next: (res) => this.categorias.set(res.data) });
  }

  loadData(): void {
    this.loading.set(true);
    this.produtosService.findAll(this.currentPage(), this.pageSize(), this.searchTerm() || undefined, this.selectedCategoria() ?? undefined).subscribe({
      next: (res) => { this.produtos.set(res.data); this.totalRecords.set(res.meta.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 }); },
    });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onCategoriaChange(id: number | null): void { this.selectedCategoria.set(id); this.currentPage.set(1); this.loadData(); }
  onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex + 1); this.pageSize.set(event.pageSize); this.loadData(); }
  getMargemClass(margem: number): string { return margem >= 30 ? 'high' : margem >= 15 ? 'medium' : 'low'; }

  openDialog(produto?: Produto): void {
    const ref = this.dialog.open(ProdutoDialogComponent, { data: { produto }, width: '800px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = produto ? this.produtosService.update(produto.id, result) : this.produtosService.create(result);
      obs.subscribe({
        next: () => { this.snackBar.open(produto ? 'Produto atualizado!' : 'Produto criado!', 'OK', { duration: 3000 }); this.loadData(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onRemove(produto: Produto): void {
    this.confirmService.confirm({
      title: 'Desativar Produto',
      message: `Desativar "${produto.nome}"?`,
      confirmText: 'Desativar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.produtosService.remove(produto.id).subscribe({
          next: () => { this.snackBar.open('Produto desativado', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro ao desativar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  openEtiquetasDialog(produto: Produto): void {
    if (!produto.codigoBarras) {
      this.snackBar.open('Este produto não possui código de barras cadastrado! Por favor, edite-o e insira o código de barras para gerar etiquetas.', 'Fechar', { duration: 5000 });
      return;
    }

    this.dialog.open(EtiquetaDialogComponent, {
      data: { produto },
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'etiquetas-dialog-panel'
    });
  }

  openImportDialog(): void {
    const ref = this.dialog.open(ImportarDialogComponent, {
      data: {
        type: 'produtos',
        title: 'Produtos',
        apiUrl: `${environment.apiUrl}/produtos/importar`
      },
      width: '600px',
      maxWidth: '95vw'
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
        this.categoriasService.findAll(1, 100).subscribe({ next: (res) => this.categorias.set(res.data) });
      }
    });
  }
}
