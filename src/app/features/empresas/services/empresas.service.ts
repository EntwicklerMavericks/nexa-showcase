// =============================================================================
// EmpresasService — HTTP client for /api/v1/empresas
// =============================================================================

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  ie: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  logo: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmpresaPayload {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  ie?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  logo?: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly url = `${environment.apiUrl}/empresas`;
  readonly activeLogo = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string): Observable<PaginatedResponse<Empresa>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResponse<Empresa>>(this.url, { params });
  }

  findOne(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.url}/${id}`);
  }

  create(data: EmpresaPayload): Observable<Empresa> {
    return this.http.post<Empresa>(this.url, data);
  }

  update(id: number, data: Partial<EmpresaPayload>): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<Empresa> {
    return this.http.delete<Empresa>(`${this.url}/${id}`);
  }

  importarCategoriasConstrucao(): Observable<any> {
    return this.http.post<any>(`${this.url}/importar-categorias-construcao`, {});
  }
}
