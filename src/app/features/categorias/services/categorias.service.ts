// =============================================================================
// CategoriasService — HTTP client for /api/v1/categorias
// =============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { produtos: number };
}

export interface CategoriaPayload {
  nome: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly url = `${environment.apiUrl}/categorias`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Categoria>>(this.url, { params });
  }

  findOne(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }

  create(data: CategoriaPayload): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, data);
  }

  update(id: number, data: Partial<CategoriaPayload>): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
