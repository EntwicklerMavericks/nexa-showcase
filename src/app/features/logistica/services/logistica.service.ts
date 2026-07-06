// =============================================================================
// LogisticaService — HTTP client for /api/v1/logistica
// =============================================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Carga {
  id: number;
  numero: number;
  motorista: string;
  placaVeiculo: string | null;
  status: 'PREPARACAO' | 'EM_ROTA' | 'ENTREGUE' | 'CANCELADA';
  dataSaida: string | null;
  observacoes: string | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { entregas: number };
  progresso?: { concluidas: number; total: number };
  entregas?: Entrega[];
  romaneioCarregamento?: { produtoId: number; nome: string; sku: string; quantidade: number; unidade: string }[];
}

export interface Entrega {
  id: number;
  vendaId: number;
  cargaId: number | null;
  status: 'PENDENTE' | 'EM_ROTA' | 'ENTREGUE' | 'FALHOU' | 'CANCELADA';
  enderecoEntrega: string;
  cidade: string;
  estado: string | null;
  cep: string | null;
  ordemEntrega: number;
  tentativas: number;
  recebedorNome: string | null;
  recebedorDocumento: string | null;
  dataEntrega: string | null;
  observacoes: string | null;
  empresaId: number;
  venda?: {
    id: number;
    numero: number;
    valorTotal: number;
    cliente?: { nome: string; cpfCnpj: string; telefone: string };
    itens?: {
      id: number;
      produto: { id: number; nome: string; sku: string; unidade: string };
      quantidade: number;
      valorUnitario: number;
      valorTotal: number;
    }[];
  };
}

@Injectable({ providedIn: 'root' })
export class LogisticaService {
  private readonly url = `${environment.apiUrl}/logistica`;

  constructor(private readonly http: HttpClient) {}

  criarEntrega(vendaId: number, enderecoEntrega: string, cidade: string, estado?: string, cep?: string, observacoes?: string) {
    return this.http.post<any>(`${this.url}/entregas`, { vendaId, enderecoEntrega, cidade, estado, cep, observacoes });
  }

  listarEntregasPendentes() {
    return this.http.get<any>(`${this.url}/entregas/pendentes`);
  }

  criarCarga(motorista: string, placaVeiculo: string, entregaIds: number[], observacoes?: string) {
    return this.http.post<any>(`${this.url}/cargas`, { motorista, placaVeiculo, entregaIds, observacoes });
  }

  listarCargas() {
    return this.http.get<any>(`${this.url}/cargas`);
  }

  obterDetalhesCarga(id: number) {
    return this.http.get<any>(`${this.url}/cargas/${id}`);
  }

  atualizarStatusCarga(id: number, status: string) {
    return this.http.patch<any>(`${this.url}/cargas/${id}/status`, { status });
  }

  atualizarStatusEntrega(id: number, status: string, recebedorNome?: string, recebedorDocumento?: string, observacoes?: string) {
    return this.http.patch<any>(`${this.url}/entregas/${id}/status`, { status, recebedorNome, recebedorDocumento, observacoes });
  }
}
