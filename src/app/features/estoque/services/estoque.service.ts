import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface EstoqueHistorico {
  id: number;
  produtoId: number;
  tipo: string;
  quantidade: number;
  quantidadeAnt: number;
  quantidadeNova: number;
  motivo: string | null;
  createdAt: string;
  produto?: { id: number; nome: string; sku: string };
}

export interface AlertaEstoque {
  id: number;
  nome: string;
  sku: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  categoriaNome: string | null;
}

export interface RelatorioReposicaoItem {
  produtoId: number;
  nome: string;
  sku: string;
  unidade: string;
  categoriaNome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  sugestaoRepor: number;
  ultimoPrecoCompra: number | null;
  ultimoFornecedorId: number | null;
  ultimoFornecedorNome: string;
  selected?: boolean;
  quantidadeAComprar?: number;
}

export interface MovimentacaoPayload {
  produtoId: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  motivo?: string;
}

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private readonly url = `${environment.apiUrl}/estoque`;
  constructor(private readonly http: HttpClient) {}

  movimentar(data: MovimentacaoPayload) {
    return this.http.post<any>(`${this.url}/movimentar`, data);
  }

  getHistorico(produtoId: number, page = 1, limit = 20) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(`${this.url}/historico/${produtoId}`, { params });
  }

  getAlertas() {
    return this.http.get<any>(`${this.url}/alertas`);
  }

  getRelatorioReposicao() {
    return this.http.get<any>(`${this.url}/relatorio-reposicao`);
  }
}
