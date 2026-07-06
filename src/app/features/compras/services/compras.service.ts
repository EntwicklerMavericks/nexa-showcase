import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Compra {
  id: number;
  numero: number | null;
  fornecedorId: number;
  fornecedor?: { id: number; nome: string; cpfCnpj: string };
  status: 'RASCUNHO' | 'CONFIRMADA' | 'FATURADA' | 'CANCELADA';
  dataCompra: string;
  formaPagamento: string;
  parcelas: number;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  observacoes: string | null;
  compradorId: number;
  notaFiscalId: number | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: ItemCompra[];
  _count?: { itens: number };
}

export interface ItemCompra {
  id: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  produto?: { id: number; nome: string; sku: string; unidade?: string };
}

export interface CompraPayload {
  fornecedorId: number;
  formaPagamento?: string;
  parcelas?: number;
  valorFrete?: number;
  valorDesconto?: number;
  observacoes?: string;
  itens: {
    produtoId: number;
    quantidade: number;
    valorUnitario: number;
    valorDesconto?: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly url = `${environment.apiUrl}/compras`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string, status?: string): Observable<PaginatedResponse<Compra>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<Compra>>(this.url, { params });
  }

  findOne(id: number): Observable<Compra> { return this.http.get<Compra>(`${this.url}/${id}`); }
  create(data: CompraPayload): Observable<Compra> { return this.http.post<Compra>(this.url, data); }
  update(id: number, data: Partial<CompraPayload>): Observable<Compra> { return this.http.patch<Compra>(`${this.url}/${id}`, data); }
  updateStatus(id: number, status: string): Observable<Compra> { return this.http.patch<Compra>(`${this.url}/${id}/status`, { status }); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
