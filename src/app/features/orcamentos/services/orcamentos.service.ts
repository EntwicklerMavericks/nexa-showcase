import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Orcamento {
  id: number;
  numero: number | null;
  clienteId: number | null;
  cliente?: { id: number; nome: string; cpfCnpj: string; email?: string | null; telefone?: string | null };
  status: 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'CONVERTIDO' | 'EXPIRADO';
  dataOrcamento: string;
  validade: string;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  observacoes: string | null;
  vendedorId: number;
  vendaId: number | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: ItemOrcamento[];
  _count?: { itens: number };
}

export interface ItemOrcamento {
  id: number;
  orcamentoId: number;
  produtoId: number;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  produto?: { id: number; nome: string; sku: string; unidade?: string };
}

export interface OrcamentoPayload {
  clienteId?: number | null;
  validade: string;
  valorFrete?: number;
  valorDesconto?: number;
  observacoes?: string;
  itens: {
    produtoId: number;
    quantidade: number;
    unidade?: string;
    valorUnitario: number;
    valorDesconto?: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrcamentosService {
  private readonly url = `${environment.apiUrl}/orcamentos`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string, status?: string): Observable<PaginatedResponse<Orcamento>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<Orcamento>>(this.url, { params });
  }

  findOne(id: number): Observable<Orcamento> {
    return this.http.get<Orcamento>(`${this.url}/${id}`);
  }

  create(data: OrcamentoPayload): Observable<Orcamento> {
    return this.http.post<Orcamento>(this.url, data);
  }

  update(id: number, data: Partial<OrcamentoPayload>): Observable<Orcamento> {
    return this.http.patch<Orcamento>(`${this.url}/${id}`, data);
  }

  enviar(id: number): Observable<Orcamento> {
    return this.http.post<Orcamento>(`${this.url}/${id}/enviar`, {});
  }

  converter(id: number, payload: { clienteId?: number; formaPagamento?: string; parcelas?: number }): Observable<any> {
    return this.http.post<any>(`${this.url}/${id}/converter`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
