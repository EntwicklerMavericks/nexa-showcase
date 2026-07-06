// =============================================================================
// NfeService — HTTP client for /api/v1/notas-fiscais
// =============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface NotaFiscal {
  id: number;
  numero: number | null;
  serie: number;
  chaveAcesso: string | null;
  naturezaOperacao: string;
  tipoOperacao: 'ENTRADA' | 'SAIDA';
  status: 'RASCUNHO' | 'AUTORIZADA' | 'CANCELADA' | 'REJEITADA' | 'DENEGADA';
  dataEmissao: string;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  destinatarioNome: string;
  destinatarioCpfCnpj: string;
  observacoes: string | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: ItemNotaFiscal[];
  _count?: { itens: number };
}

export interface ItemNotaFiscal {
  id: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  produto?: { id: number; nome: string; sku: string; unidade?: string };
}

export interface NfePayload {
  naturezaOperacao: string;
  tipoOperacao?: string;
  serie?: number;
  destinatarioNome: string;
  destinatarioCpfCnpj: string;
  observacoes?: string;
  valorFrete?: number;
  valorDesconto?: number;
  itens: {
    produtoId: number;
    quantidade: number;
    valorUnitario: number;
    valorDesconto?: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class NfeService {
  private readonly url = `${environment.apiUrl}/notas-fiscais`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string, status?: string): Observable<PaginatedResponse<NotaFiscal>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResponse<NotaFiscal>>(this.url, { params });
  }

  findOne(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.url}/${id}`);
  }

  create(data: NfePayload): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.url, data);
  }

  update(id: number, data: Partial<NfePayload>): Observable<NotaFiscal> {
    return this.http.patch<NotaFiscal>(`${this.url}/${id}`, data);
  }

  updateStatus(id: number, status: string): Observable<NotaFiscal> {
    return this.http.patch<NotaFiscal>(`${this.url}/${id}/status`, { status });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
