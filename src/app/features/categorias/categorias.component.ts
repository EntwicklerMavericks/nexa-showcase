import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoriasService, Categoria } from './services/categorias.service';
import { CategoriaDialogComponent } from './dialogs/categoria-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { NexaDataTableComponent, ColumnConfig, NexaCustomCellDirective } from '../../shared/components/data-table/nexa-data-table.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatSnackBarModule, NexaDataTableComponent, NexaCustomCellDirective],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {
  readonly categorias = signal<Categoria[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly loading = signal(false);
  
  readonly columns: ColumnConfig[] = [
    { key: 'id', label: 'ID', hideOnMobile: true },
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição', hideOnMobile: true },
    { key: 'produtos', label: 'Produtos' },
    { key: 'status', label: 'Status', hideOnMobile: true },
    { key: 'acoes', label: 'Ações' }
  ];
  private searchSubject = new Subject<string>();

  constructor(private categoriasService: CategoriasService, private dialog: MatDialog, private snackBar: MatSnackBar, private confirmService: ConfirmDialogService) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term); this.currentPage.set(1); this.loadData();
    });
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.categoriasService.findAll(this.currentPage(), this.pageSize(), this.searchTerm() || undefined).subscribe({
      next: (res) => { this.categorias.set(res.data); this.totalRecords.set(res.meta.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Erro ao carregar categorias', 'Fechar', { duration: 3000 }); },
    });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex + 1); this.pageSize.set(event.pageSize); this.loadData(); }

  openDialog(categoria?: Categoria): void {
    const ref = this.dialog.open(CategoriaDialogComponent, { data: { categoria }, width: '500px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = categoria ? this.categoriasService.update(categoria.id, result) : this.categoriasService.create(result);
      obs.subscribe({
        next: () => { this.snackBar.open(categoria ? 'Categoria atualizada!' : 'Categoria criada!', 'OK', { duration: 3000 }); this.loadData(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onRemove(categoria: Categoria): void {
    this.confirmService.confirm({
      title: 'Desativar Categoria',
      message: `Desativar categoria "${categoria.nome}"?`,
      confirmText: 'Desativar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.categoriasService.remove(categoria.id).subscribe({
          next: () => { this.snackBar.open('Categoria desativada', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro ao desativar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }
}
