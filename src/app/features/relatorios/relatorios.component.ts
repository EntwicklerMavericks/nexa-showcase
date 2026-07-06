import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { RelatoriosService } from './services/relatorios.service';
import { forkJoin } from 'rxjs';

interface ChartPoint {
  x: number;
  y: number;
  data: string;
  valor: number;
  quantidade: number;
}

interface FluxoBar {
  data: string;
  receitas: number;
  despesas: number;
  receitaHeight: number;
  despesaHeight: number;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './relatorios.component.html',
})
export class RelatoriosComponent implements OnInit {
  // Exposição do objeto Math global para uso no template HTML
  readonly Math = Math;

  // ── Filtros ────────────────────────────────────────────────────────────────
  readonly dataInicio = signal(this.getFirstDayOfMonth());
  readonly dataFim = signal(this.getTodayDate());

  // ── Estados de Dados ────────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly dre = signal<any>(null);
  readonly topProdutos = signal<any[]>([]);
  readonly totalFaturamentoPeriodo = signal(0);
  readonly vendasPeriodo = signal<any[]>([]);
  readonly fluxoCaixa = signal<any[]>([]);

  // Coordenadas ativas do ponto selecionado no gráfico (Tooltip)
  readonly activePoint = signal<ChartPoint | null>(null);

  constructor(
    private readonly relatoriosService: RelatoriosService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.carregarRelatorios();
  }

  private getFirstDayOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  parseAndSetDate(d: Date, signalRef: any): void {
    if (d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      signalRef.set(`${year}-${month}-${day}`);
    }
  }

  carregarRelatorios(): void {
    const inicio = this.dataInicio();
    const fim = this.dataFim();

    if (!inicio || !fim) {
      this.snackBar.open('Selecione ambas as datas do período', 'OK', { duration: 3000 });
      return;
    }

    if (new Date(inicio) > new Date(fim)) {
      this.snackBar.open('A data de início não pode ser maior que a data de fim', 'OK', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    forkJoin({
      dre: this.relatoriosService.getDre(inicio, fim),
      top: this.relatoriosService.getTopProdutos(inicio, fim),
      vendas: this.relatoriosService.getVendasPeriodo(inicio, fim),
      fluxo: this.relatoriosService.getFluxoCaixa(inicio, fim),
    }).subscribe({
      next: (res) => {
        this.dre.set(res.dre);
        this.topProdutos.set(res.top?.produtos || []);
        this.totalFaturamentoPeriodo.set(res.top?.totalFaturamentoPeriodo || 0);
        this.vendasPeriodo.set(res.vendas || []);
        this.fluxoCaixa.set(res.fluxo || []);
        this.activePoint.set(null); // Reseta tooltip
        this.loading.set(false);
      },
      error: (err) => {
        this.loggerError(err);
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar relatórios analíticos', 'Fechar', { duration: 3000 });
      },
    });
  }

  private loggerError(err: any): void {
    console.error('Erro de BI Relatórios:', err);
  }

  // ── Cálculo do Gráfico SVG de Linha (Faturamento) ──────────────────────────
  readonly lineChartData = computed(() => {
    const dados = this.vendasPeriodo();
    if (dados.length === 0) return { path: '', areaPath: '', points: [] };

    const width = 800;
    const height = 240;
    const padding = 30;

    const maxValor = Math.max(...dados.map((d) => d.valor), 100);
    const totalPoints = dados.length;

    const points: ChartPoint[] = dados.map((d, index) => {
      const x = padding + (index / Math.max(totalPoints - 1, 1)) * (width - padding * 2);
      const y = height - padding - (d.valor / maxValor) * (height - padding * 2);
      return { x, y, data: d.data, valor: d.valor, quantidade: d.quantidade };
    });

    // Construir a string de caminho SVG (M para mover, L para desenhar linha)
    let path = '';
    let areaPath = '';

    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }

      // Área sombreada sob a linha
      areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    }

    return { path, areaPath, points };
  });

  // ── Cálculo do Gráfico de Fluxo de Caixa Comparativo ──────────────────────
  readonly fluxoCaixaBars = computed<FluxoBar[]>(() => {
    const dados = this.fluxoCaixa();
    if (dados.length === 0) return [];

    const maxValor = Math.max(...dados.map((d) => Math.max(d.receitas, d.despesas)), 100);
    const maxHeight = 160; // Altura máxima da barra em px

    return dados.map((d) => ({
      data: d.data,
      receitas: d.receitas,
      despesas: d.despesas,
      receitaHeight: (d.receitas / maxValor) * maxHeight,
      despesaHeight: (d.despesas / maxValor) * maxHeight,
    }));
  });

  // ── Manipuladores de Tooltip do Gráfico ────────────────────────────────────
  showPointDetails(point: ChartPoint): void {
    this.activePoint.set(point);
  }

  hidePointDetails(): void {
    // Mantém o ponto até o hover sair
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  }
}
