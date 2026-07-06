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
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { OrcamentosService, Orcamento } from './services/orcamentos.service';
import { OrcamentoDialogComponent } from './dialogs/orcamento-dialog.component';
import { ConverterDialogComponent } from './dialogs/converter-dialog.component';
import { AuthService } from '../../core/auth/auth.service';
import { EmpresasService, Empresa } from '../empresas/services/empresas.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { PrintService } from '../../shared/services/print.service';

@Component({
  selector: 'app-orcamentos',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDialogModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './orcamentos.component.html',
})
export class OrcamentosComponent implements OnInit {
  readonly orcamentos = signal<Orcamento[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<string | null>(null);
  readonly loading = signal(false);

  readonly displayedColumns = ['numero', 'cliente', 'dataOrcamento', 'validade', 'valorTotal', 'status', 'acoes'];
  private searchSubject = new Subject<string>();

  constructor(
    private orcamentosService: OrcamentosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private empresasService: EmpresasService,
    private confirmService: ConfirmDialogService,
    private printService: PrintService,
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
    this.orcamentosService.findAll(
      this.currentPage(), this.pageSize(),
      this.searchTerm() || undefined, this.selectedStatus() ?? undefined,
    ).subscribe({
      next: (res) => {
        this.orcamentos.set(res.data);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => { 
        this.loading.set(false); 
        this.snackBar.open('Erro ao carregar orçamentos', 'Fechar', { duration: 3000 }); 
      },
    });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onStatusChange(status: string | null): void { this.selectedStatus.set(status); this.currentPage.set(1); this.loadData(); }
  onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex + 1); this.pageSize.set(event.pageSize); this.loadData(); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      RASCUNHO: 'status-rascunho',
      ENVIADO: 'status-confirmada',
      APROVADO: 'status-faturada',
      REJEITADO: 'status-cancelada',
      CONVERTIDO: 'status-faturada',
      EXPIRADO: 'status-cancelada'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      RASCUNHO: 'Rascunho',
      ENVIADO: 'Enviado',
      APROVADO: 'Aprovado',
      REJEITADO: 'Rejeitado',
      CONVERTIDO: 'Convertido',
      EXPIRADO: 'Expirado'
    };
    return map[status] || status;
  }

  openDialog(orcamento?: Orcamento): void {
    if (orcamento) {
      this.loading.set(true);
      this.orcamentosService.findOne(orcamento.id).subscribe({
        next: (res) => { 
          this.loading.set(false); 
          this.openOrcamentoDialog(res); 
        },
        error: () => { 
          this.loading.set(false); 
          this.snackBar.open('Erro ao carregar detalhes', 'Fechar', { duration: 3000 }); 
        },
      });
    } else {
      this.openOrcamentoDialog(undefined);
    }
  }

  private openOrcamentoDialog(orcamento?: Orcamento): void {
    const ref = this.dialog.open(OrcamentoDialogComponent, { 
      data: { orcamento }, 
      width: '1000px', 
      maxWidth: '95vw' 
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = orcamento ? this.orcamentosService.update(orcamento.id, result) : this.orcamentosService.create(result);
      obs.subscribe({
        next: () => {
          this.snackBar.open(orcamento ? 'Orçamento atualizado!' : 'Orçamento criado!', 'OK', { duration: 3000 });
          this.loadData();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onEnviar(orcamento: Orcamento): void {
    this.confirmService.confirm({
      title: 'Enviar Orçamento',
      message: `Marcar orçamento #${orcamento.numero} como ENVIADO para o cliente?`,
      confirmText: 'Enviar',
      isDanger: false,
    }).subscribe(res => {
      if (res) {
        this.orcamentosService.enviar(orcamento.id).subscribe({
          next: () => { 
            this.snackBar.open('Orçamento enviado com sucesso!', 'OK', { duration: 3000 }); 
            this.loadData(); 
          },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao enviar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onConverter(orcamento: Orcamento): void {
    // Open Converter dialog to check customer, payment, installment selection
    const ref = this.dialog.open(ConverterDialogComponent, {
      data: { orcamento },
      width: '460px'
    });

    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.loading.set(true);
      this.orcamentosService.converter(orcamento.id, payload).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.snackBar.open(`Orçamento #${orcamento.numero} convertido na Venda #${res.venda.numero}!`, 'OK', { duration: 5000 });
          this.loadData();
        },
        error: (err) => {
          this.loading.set(false);
          this.snackBar.open(err.error?.message || 'Erro ao converter orçamento', 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  onRemove(orcamento: Orcamento): void {
    this.confirmService.confirm({
      title: 'Excluir Orçamento',
      message: `Excluir o orçamento #${orcamento.numero}?`,
      confirmText: 'Excluir',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.orcamentosService.remove(orcamento.id).subscribe({
          next: () => { 
            this.snackBar.open('Orçamento excluído', 'OK', { duration: 3000 }); 
            this.loadData(); 
          },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }

  onImprimir(orcamento: Orcamento): void {
    this.loading.set(true);
    // Load full details with items before printing
    this.orcamentosService.findOne(orcamento.id).subscribe({
      next: (fullOrcamento) => {
        const user = this.authService.currentUser();
        if (user && user.empresaId) {
          this.empresasService.findOne(user.empresaId).subscribe({
            next: (empresa) => {
              this.loading.set(false);
              this.printService.printOrcamento(fullOrcamento, empresa);
            },
            error: () => {
              this.loading.set(false);
              this.printService.printOrcamento(fullOrcamento, null);
            }
          });
        } else {
          this.loading.set(false);
          this.printService.printOrcamento(fullOrcamento, null);
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar dados do orçamento para impressão', 'Fechar', { duration: 3000 });
      }
    });
  }
}
