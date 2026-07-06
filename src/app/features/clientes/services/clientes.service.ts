import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Cliente {
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
  limiteCredito?: number;
  saldoDevedor?: number;
  ativo: boolean;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { vendas: number };
}

export interface ClientePayload {
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
  limiteCredito?: number;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly url = `${environment.apiUrl}/clientes`;

  constructor(private readonly http: HttpClient) {}

  findAll(page = 1, limit = 20, search?: string, tipo?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<PaginatedResponse<Cliente>>(this.url, { params });
  }

  findOne(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  create(data: ClientePayload): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, data);
  }

  update(id: number, data: Partial<ClientePayload>): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
