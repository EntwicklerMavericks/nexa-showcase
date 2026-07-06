import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Fornecedor {
  id: number;
  nome: string;
  cpfCnpj: string;
  tipo: string;
  ie: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  observacoes: string | null;
  ativo: boolean;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { compras: number };
}

export interface FornecedorPayload {
  nome: string;
  cpfCnpj: string;
  tipo?: string;
  ie?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

@Injectable({ providedIn: 'root' })
export class FornecedoresService {
  private readonly url = `${environment.apiUrl}/fornecedores`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string, tipo?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<PaginatedResponse<Fornecedor>>(this.url, { params });
  }

  findOne(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.url}/${id}`);
  }

  create(data: FornecedorPayload): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.url, data);
  }

  update(id: number, data: Partial<FornecedorPayload>): Observable<Fornecedor> {
    return this.http.patch<Fornecedor>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
