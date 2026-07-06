// =============================================================================
// LogisticaComponent — Main UI dashboard for delivery logistics
// =============================================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogisticaService, Carga, Entrega } from './services/logistica.service';
import { CargaDialogComponent } from './dialogs/carga-dialog.component';
import { RomaneioDialogComponent } from './dialogs/romaneio-dialog.component';
import { BaixaEntregaDialogComponent } from './dialogs/baixa-entrega-dialog.component';
import { MenuNotificationService } from '../../core/layout/services/menu-notification.service';

@Component({
  selector: 'app-logistica',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './logistica.component.html',
  styleUrl: './logistica.component.scss'
})
export class LogisticaComponent implements OnInit {
  activeTab = signal<'pendentes' | 'cargas'>('pendentes');
  entregasPendentes = signal<Entrega[]>([]);
  cargas = signal<Carga[]>([]);
  selectedEntregas = signal<Set<number>>(new Set());

  constructor(
    private logisticaService: LogisticaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private menuNotificationService: MenuNotificationService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    // Carrega as entregas pendentes para a aba e badge
    this.logisticaService.listarEntregasPendentes().subscribe({
      next: (res) => {
        const list = res.data || res || [];
        this.entregasPendentes.set(list);
      },
      error: () => this.snackBar.open('Erro ao carregar entregas pendentes', 'Fechar', { duration: 3000 }),
    });

    // Carrega as cargas para a aba e badge
    this.logisticaService.listarCargas().subscribe({
      next: (res) => this.cargas.set(res.data || res || []),
      error: () => this.snackBar.open('Erro ao carregar cargas', 'Fechar', { duration: 3000 }),
    });
  }

  setTab(tab: 'pendentes' | 'cargas'): void {
    this.activeTab.set(tab);
    this.selectedEntregas.set(new Set());
    this.carregarDados();
  }

  cargasAtivasCount(): number {
    return this.cargas().filter((c) => c.status === 'PREPARACAO' || c.status === 'EM_ROTA').length;
  }

  // Checkbox logic
  toggleSelection(id: number): void {
    const current = new Set(this.selectedEntregas());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedEntregas.set(current);
  }

  toggleAll(event: any): void {
    if (event.target.checked) {
      const ids = this.entregasPendentes().map((e) => e.id);
      this.selectedEntregas.set(new Set(ids));
    } else {
      this.selectedEntregas.set(new Set());
    }
  }

  isAllSelected(): boolean {
    return this.entregasPendentes().length > 0 && this.selectedEntregas().size === this.entregasPendentes().length;
  }

  getMaterialsCount(ent: Entrega): number {
    return ent.venda?.itens?.reduce((acc, item) => acc + item.quantidade, 0) || 0;
  }

  getMaterialsTooltip(ent: Entrega): string {
    return ent.venda?.itens?.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ') || '';
  }

  getProgressPercent(carga: Carga): number {
    if (!carga.progresso || carga.progresso.total === 0) return 0;
    return Math.round((carga.progresso.concluidas / carga.progresso.total) * 100);
  }

  // Dialog actions
  openMontarCargaDialog(): void {
    const list = this.entregasPendentes().filter((e) => this.selectedEntregas().has(e.id));
    const ref = this.dialog.open(CargaDialogComponent, {
      data: { entregas: list },
      width: '800px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.setTab('cargas');
      }
    });
  }

  openRomaneioPrint(cargaId: number): void {
    this.dialog.open(RomaneioDialogComponent, {
      data: { cargaId },
      width: '850px',
      maxWidth: '95vw',
      panelClass: 'romaneio-dialog-panel'
    });
  }

  openBaixaEntrega(entrega: Entrega): void {
    const ref = this.dialog.open(BaixaEntregaDialogComponent, {
      data: { entrega },
      width: '500px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarDados();
      }
    });
  }

  iniciarRota(cargaId: number): void {
    this.logisticaService.atualizarStatusCarga(cargaId, 'EM_ROTA').subscribe({
      next: () => {
        this.snackBar.open('Carga em rota! Entregas atualizadas para trânsito.', 'OK', { duration: 3000 });
        this.carregarDados();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Erro ao iniciar rota.', 'Fechar', { duration: 3000 }),
    });
  }
}
