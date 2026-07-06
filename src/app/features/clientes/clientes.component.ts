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
import { ClientesService, Cliente } from './services/clientes.service';
import { ClienteDialogComponent } from './dialogs/cliente-dialog.component';
import { ImportarDialogComponent } from '../../shared/dialogs/importar-dialog.component';
import { CrediarioExtratoDialogComponent } from './dialogs/crediario-extrato-dialog.component';
import { environment } from '../../../environments/environment';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { NexaDataTableComponent, ColumnConfig, NexaCustomCellDirective } from '../../shared/components/data-table/nexa-data-table.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDialogModule, MatTooltipModule, MatSnackBarModule, NexaDataTableComponent, NexaCustomCellDirective],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  readonly clientes = signal<Cliente[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly selectedTipo = signal<string | null>(null);
  readonly loading = signal(false);
  
  readonly columns: ColumnConfig[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'cpfCnpj', label: 'CPF / CNPJ', hideOnMobile: true },
    { key: 'tipo', label: 'Tipo', hideOnMobile: true },
    { key: 'telefone', label: 'Telefone', hideOnMobile: true },
    { key: 'cidade', label: 'Cidade/UF', hideOnMobile: true },
    { key: 'limiteCredito', label: 'Limite', hideOnMobile: true },
    { key: 'saldoDevedor', label: 'Saldo', hideOnMobile: true },
    { key: 'status', label: 'Status' },
    { key: 'acoes', label: 'Ações' }
  ];
  private searchSubject = new Subject<string>();

  constructor(
    private clientesService: ClientesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmService: ConfirmDialogService,
  ) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.clientesService.findAll(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm() || undefined,
      this.selectedTipo() ?? undefined,
    ).subscribe({
      next: (res) => {
        this.clientes.set(res.data);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar clientes', 'Fechar', { duration: 3000 });
      },
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onTipoChange(tipo: string | null): void {
    this.selectedTipo.set(tipo);
    this.currentPage.set(1);
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  getTipoClass(tipo: string): string {
    return tipo === 'PF' ? 'tipo-pf' : 'tipo-pj';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
  }

  openDialog(cliente?: Cliente): void {
    const ref = this.dialog.open(ClienteDialogComponent, {
      data: { cliente },
      width: '800px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = cliente
        ? this.clientesService.update(cliente.id, result)
        : this.clientesService.create(result);
      obs.subscribe({
        next: () => {
          this.snackBar.open(cliente ? 'Cliente atualizado!' : 'Cliente criado!', 'OK', { duration: 3000 });
          this.loadData();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onRemove(cliente: Cliente): void {
    this.confirmService.confirm({
      title: 'Desativar Cliente',
      message: `Desativar "${cliente.nome}"?`,
      confirmText: 'Desativar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.clientesService.remove(cliente.id).subscribe({
          next: () => {
            this.snackBar.open('Cliente desativado', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao desativar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  openImportDialog(): void {
    const ref = this.dialog.open(ImportarDialogComponent, {
      data: {
        type: 'clientes',
        title: 'Clientes',
        apiUrl: `${environment.apiUrl}/clientes/importar`
      },
      width: '600px',
      maxWidth: '95vw'
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  verExtrato(cliente: Cliente): void {
    const ref = this.dialog.open(CrediarioExtratoDialogComponent, {
      data: { cliente },
      width: '850px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe(() => {
      this.loadData();
    });
  }
}
