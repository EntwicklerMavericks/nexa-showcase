import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RelatoriosService } from '../relatorios/services/relatorios.service';
import { CategoriasService } from '../categorias/services/categorias.service';
import { OnboardingWizardComponent } from './onboarding-wizard.component';

export interface DashboardData {
  faturamentoHoje: number;
  vendasHojeCount: number;
  faturamentoMes: number;
  ticketMedio: number;
  orcamentosPendentes: number;
  estoqueCritico: number;
  vendasDiarias: Array<{ data: string; valor: number; quantidade: number }>;
  topProdutos: Array<{
    produtoId: number;
    nome: string;
    sku: string;
    quantidade: number;
    faturamento: number;
    participacaoPercentual: number;
  }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    OnboardingWizardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(false);
  readonly hasOnboarded = signal(true);

  // SVG Chart Helper states
  readonly maxSaleVal = computed(() => {
    const list = this.data()?.vendasDiarias || [];
    if (list.length === 0) return 1000;
    const max = Math.max(...list.map((d) => d.valor));
    return max > 0 ? max * 1.15 : 1000; // 15% margin above peak
  });

  readonly firstDate = computed(() => {
    const list = this.data()?.vendasDiarias || [];
    return list.length > 0 ? new Date(list[0].data) : new Date();
  });

  readonly midDate = computed(() => {
    const list = this.data()?.vendasDiarias || [];
    if (list.length === 0) return new Date();
    return new Date(list[Math.floor(list.length / 2)].data);
  });

  readonly lastDate = computed(() => {
    const list = this.data()?.vendasDiarias || [];
    return list.length > 0 ? new Date(list[list.length - 1].data) : new Date();
  });

  constructor(
    private readonly relatoriosService: RelatoriosService,
    private readonly categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.checkOnboardingStatus();
    this.loadDashboardData();
  }

  checkOnboardingStatus(): void {
    this.categoriasService.findAll(1, 1).subscribe({
      next: (res: any) => {
        const list = res.data || res;
        const total = res.meta?.total !== undefined ? res.meta.total : (list?.length || 0);
        this.hasOnboarded.set(total > 0);
      }
    });
  }

  finishOnboarding(): void {
    this.hasOnboarded.set(true);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.relatoriosService.getDashboardConsolidado().subscribe({
      next: (res) => {
        this.data.set(res || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  // Calculate coordinates string for polyline
  svgPoints(): string {
    const list = this.data()?.vendasDiarias || [];
    if (list.length === 0) return '';
    const max = this.maxSaleVal();
    const width = 600;
    const height = 180;
    
    return list.map((d, idx) => {
      const x = (idx / (list.length - 1)) * width;
      const y = height - (d.valor / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  // Calculate filled path points string under the curve
  svgAreaPath(): string {
    const points = this.svgPoints();
    if (!points) return '';
    const width = 600;
    const height = 180;
    return `M 0,${height} L ${points} L ${width},${height} Z`;
  }

  // Calculate coordinates for circle elements on the points
  svgDotCoords() {
    const list = this.data()?.vendasDiarias || [];
    if (list.length === 0) return [];
    const max = this.maxSaleVal();
    const width = 600;
    const height = 180;

    return list.map((d, idx) => {
      const x = (idx / (list.length - 1)) * width;
      const y = height - (d.valor / max) * height;
      const formattedDate = new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const formattedVal = d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      return {
        index: idx,
        x: x.toFixed(1),
        y: y.toFixed(1),
        tooltip: `${formattedDate}: ${formattedVal} (${d.quantidade} venda(s))`
      };
    }).filter((_, idx) => {
      // Show every 3rd point or endpoints to keep chart clean in mobile
      return idx === 0 || idx === list.length - 1 || idx % 4 === 0;
    });
  }
}
