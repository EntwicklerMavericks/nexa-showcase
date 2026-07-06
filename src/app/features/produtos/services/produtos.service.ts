// =============================================================================
// ProdutosService — HTTP client for /api/v1/produtos
// =============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NexaDBService } from '../../../core/offline/db/nexa-db.service';
import { from, Observable } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  codigoBarras: string | null;
  sku: string;
  unidade: string;
  unidadeEstoque?: string;
  unidadeVenda?: string;
  fatorConversao?: number;
  precoCusto: number;
  precoVenda: number;
  margemLucro: number;
  ncm: string | null;
  cfop: string | null;
  cst: string | null;
  estoqueMinimo: number;
  estoqueAtual: number;
  ativo: boolean;
  categoriaId: number;
  categoria?: { id: number; nome: string };
  empresaId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProdutoPayload {
  nome: string;
  sku: string;
  precoCusto: number;
  precoVenda: number;
  categoriaId: number;
  descricao?: string;
  codigoBarras?: string;
  unidade?: string;
  unidadeEstoque?: string;
  unidadeVenda?: string;
  fatorConversao?: number;
  ncm?: string;
  cfop?: string;
  cst?: string;
  estoqueMinimo?: number;
}

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private readonly url = `${environment.apiUrl}/produtos`;

  constructor(
    private readonly http: HttpClient,
    private db: NexaDBService
  ) {}

  findAll(page = 1, limit = 20, search?: string, categoriaId?: number): Observable<PaginatedResponse<Produto>> {
    if (!navigator.onLine) {
      // Offline fallback
      return from((async () => {
        let collection = this.db.produtos.toCollection();
        
        if (search) {
          const s = search.toLowerCase();
          collection = this.db.produtos.filter(p => 
            p.nome.toLowerCase().includes(s) || 
            (p.codigoBarras || '').includes(s) || 
            p.sku.toLowerCase().includes(s)
          );
        }

        if (categoriaId) {
          collection = collection.filter(p => p.categoriaId === categoriaId);
        }

        const offset = (page - 1) * limit;
        const data = await collection.offset(offset).limit(limit).toArray();
        const total = await collection.count();

        return { data, meta: { total, page, limit } };
      })());
    }

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) params = params.set('search', search);
    if (categoriaId) params = params.set('categoriaId', categoriaId);

    return this.http.get<PaginatedResponse<Produto>>(this.url, { params });
  }

  findOne(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.url}/${id}`);
  }

  create(data: ProdutoPayload): Observable<Produto> {
    return this.http.post<Produto>(this.url, data);
  }

  update(id: number, data: Partial<ProdutoPayload>): Observable<Produto> {
    return this.http.patch<Produto>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  importar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.url}/importar`, formData);
  }
}
