import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Cliente } from '../services/clientes.service';
import { FinanceiroService } from '../../financeiro/services/financeiro.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { PrintService } from '../../../shared/services/print.service';

export interface CrediarioExtratoDialogData {
  cliente: Cliente;
}

@Component({
  selector: 'app-crediario-extrato-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './crediario-extrato-dialog.component.html',
  styleUrl: './crediario-extrato-dialog.component.css',
})
export class CrediarioExtratoDialogComponent implements OnInit {
  readonly client = signal<Cliente | null>(null);
  readonly loading = signal(false);
  readonly parcelas = signal<any[]>([]);
  readonly displayedColumns = ['descricao', 'dataVencimento', 'valor', 'status', 'acoes'];

  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly snackBar: MatSnackBar,
    private readonly confirmService: ConfirmDialogService,
    private readonly printService: PrintService,
    @Inject(MAT_DIALOG_DATA) public data: CrediarioExtratoDialogData,
  ) {
    if (data.cliente) {
      this.client.set(data.cliente);
    }
  }

  ngOnInit(): void {
    this.loadExtrato();
  }

  loadExtrato(): void {
    const c = this.client();
    if (!c) return;
    this.loading.set(true);
    this.financeiroService.getContasReceber(1, 100, undefined, undefined, undefined, c.id).subscribe({
      next: (res) => {
        this.parcelas.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar parcelas de crediário', 'Fechar', { duration: 3000 });
      },
    });
  }

  baixarParcela(id: number): void {
    this.confirmService.confirm({
      title: 'Confirmar Recebimento',
      message: 'Confirmar recebimento (baixa) desta parcela?',
      confirmText: 'Confirmar',
      isDanger: false,
    }).subscribe(res => {
      if (res) {
        this.financeiroService.baixarReceber(id).subscribe({
          next: () => {
            this.snackBar.open('Parcela recebida com sucesso!', 'OK', { duration: 3000 });
            this.loadExtrato();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Erro ao realizar baixa', 'Fechar', { duration: 3000 });
          },
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAGO': return 'Pago';
      case 'CANCELADO': return 'Cancelado';
      case 'ATRASADO': return 'Atrasado';
      default: return 'Pendente';
    }
  }

  imprimirCarne(): void {
    const openItems = this.parcelas().filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADO');
    if (openItems.length === 0) {
      this.snackBar.open('Não há parcelas em aberto para imprimir no carnê', 'OK', { duration: 3000 });
      return;
    }

    this.printService.printCarneCrediario(this.client()!, openItems);
  }
}
