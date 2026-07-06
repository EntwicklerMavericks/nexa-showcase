// =============================================================================
// UsuariosService — HTTP client for /api/v1/usuarios
// =============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'CAIXA';
  ativo: boolean;
  avatarUrl?: string;
  empresaId: number | null;
  empresa?: { id: number; razaoSocial: string; nomeFantasia: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioPayload {
  nome: string;
  email: string;
  senha?: string;
  role?: string;
  avatarUrl?: string;
  empresaId?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly url = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResponse<Usuario>>(this.url, { params });
  }

  findOne(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/me`);
  }

  create(data: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, data);
  }

  update(id: number, data: Partial<UsuarioPayload>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
