import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NexaDBService } from '../../../core/offline/db/nexa-db.service';
import { from, Observable } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

export interface Venda {
  id: number;
  numero: number | null;
  clienteId: number;
  cliente?: { id: number; nome: string; cpfCnpj: string; endereco?: string; cidade?: string; estado?: string; cep?: string };
  status: 'RASCUNHO' | 'CONFIRMADA' | 'FATURADA' | 'CANCELADA';
  dataVenda: string;
  formaPagamento: string;
  parcelas: number;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  observacoes: string | null;
  vendedorId: number;
  notaFiscalId: number | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: ItemVenda[];
  _count?: { itens: number };
  entrega?: { id: number; status: string } | null;
}

export interface ItemVenda {
  id: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  produto?: { id: number; nome: string; sku: string; unidade?: string };
}

export interface VendaPayload {
  clienteId: number;
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
export class VendasService {
  private readonly url = `${environment.apiUrl}/vendas`;

  constructor(
    private readonly http: HttpClient,
    private db: NexaDBService
  ) {}

  findAll(page = 1, limit = 20, search?: string, status?: string): Observable<PaginatedResponse<Venda>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<Venda>>(this.url, { params });
  }

  findOne(id: number): Observable<Venda> { return this.http.get<Venda>(`${this.url}/${id}`); }
  
  create(data: VendaPayload): Observable<any> { 
    if (!navigator.onLine) {
      // Offline fallback: Salva no outbox
      return from((async () => {
        const localId = crypto.randomUUID();
        await this.db.outboxVendas.add({
          localId,
          payload: data,
          status: 'PENDING',
          createdAt: Date.now()
        });
        return { 
          id: -1, 
          numero: -1, 
          status: 'CONFIRMADA', 
          message: 'Venda salva offline. Será sincronizada automaticamente.' 
        };
      })());
    }

    return this.http.post<any>(this.url, data); 
  }
  update(id: number, data: Partial<VendaPayload>): Observable<Venda> { return this.http.patch<Venda>(`${this.url}/${id}`, data); }
  updateStatus(id: number, status: string): Observable<Venda> { return this.http.patch<Venda>(`${this.url}/${id}/status`, { status }); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
