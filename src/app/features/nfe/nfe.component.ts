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
import { NfeService, NotaFiscal } from './services/nfe.service';
import { NfeDialogComponent } from './dialogs/nfe-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-nfe',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDialogModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './nfe.component.html',
})
export class NfeComponent implements OnInit {
  readonly notas = signal<NotaFiscal[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<string | null>(null);
  readonly loading = signal(false);
  readonly displayedColumns = ['numero', 'destinatario', 'cpfCnpj', 'valorTotal', 'status', 'dataEmissao', 'itens', 'acoes'];
  private searchSubject = new Subject<string>();

  constructor(private nfeService: NfeService, private dialog: MatDialog, private snackBar: MatSnackBar, private confirmService: ConfirmDialogService) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term); this.currentPage.set(1); this.loadData();
    });
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.nfeService.findAll(this.currentPage(), this.pageSize(), this.searchTerm() || undefined, this.selectedStatus() ?? undefined).subscribe({
      next: (res) => { this.notas.set(res.data); this.totalRecords.set(res.meta.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Erro ao carregar notas fiscais', 'Fechar', { duration: 3000 }); },
    });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onStatusChange(status: string | null): void { this.selectedStatus.set(status); this.currentPage.set(1); this.loadData(); }
  onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex + 1); this.pageSize.set(event.pageSize); this.loadData(); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      RASCUNHO: 'status-rascunho', AUTORIZADA: 'status-autorizada',
      CANCELADA: 'status-cancelada', REJEITADA: 'status-rejeitada', DENEGADA: 'status-rejeitada',
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      RASCUNHO: 'Rascunho', AUTORIZADA: 'Autorizada',
      CANCELADA: 'Cancelada', REJEITADA: 'Rejeitada', DENEGADA: 'Denegada',
    };
    return map[status] || status;
  }

  openDialog(nfe?: NotaFiscal): void {
    if (nfe) {
      this.loading.set(true);
      this.nfeService.findOne(nfe.id).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.openNfeDialog(res);
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('Erro ao carregar detalhes da NF-e', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.openNfeDialog();
    }
  }

  private openNfeDialog(nfe?: NotaFiscal): void {
    const ref = this.dialog.open(NfeDialogComponent, { data: { nfe }, width: '900px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = nfe ? this.nfeService.update(nfe.id, result) : this.nfeService.create(result);
      obs.subscribe({
        next: () => { this.snackBar.open(nfe ? 'NF-e atualizada!' : 'NF-e criada!', 'OK', { duration: 3000 }); this.loadData(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onAutorizar(nfe: NotaFiscal): void {
    this.confirmService.confirm({
      title: 'Autorizar NF-e',
      message: `Autorizar NF-e para "${nfe.destinatarioNome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Autorizar',
      isDanger: false,
    }).subscribe(res => {
      if (res) {
        this.nfeService.updateStatus(nfe.id, 'AUTORIZADA').subscribe({
          next: () => { this.snackBar.open('NF-e autorizada!', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao autorizar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onCancelar(nfe: NotaFiscal): void {
    this.confirmService.confirm({
      title: 'Cancelar NF-e',
      message: `Cancelar NF-e nº ${nfe.numero}/${nfe.serie}?`,
      confirmText: 'Cancelar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.nfeService.updateStatus(nfe.id, 'CANCELADA').subscribe({
          next: () => { this.snackBar.open('NF-e cancelada', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao cancelar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onRemove(nfe: NotaFiscal): void {
    this.confirmService.confirm({
      title: 'Excluir Rascunho',
      message: `Excluir rascunho da NF-e para "${nfe.destinatarioNome}"?`,
      confirmText: 'Excluir',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.nfeService.remove(nfe.id).subscribe({
          next: () => { this.snackBar.open('NF-e excluída', 'OK', { duration: 3000 }); this.loadData(); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }
}
