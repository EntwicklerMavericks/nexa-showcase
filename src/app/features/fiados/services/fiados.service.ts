import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FiadoResumo {
  cliente: {
    id: number;
    nome: string;
    telefone: string;
    cpfCnpj: string;
  };
  saldoDevedorTotal: number;
  saldoAtrasado: number;
  quantidadeTitulos: number;
  titulosAtrasados: number;
}

export interface PaginatedFiados {
  data: FiadoResumo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class FiadosService {
  private apiUrl = `${environment.apiUrl}/fiados`;

  constructor(private http: HttpClient) {}

  getResumo(page = 1, limit = 20, search = ''): Observable<PaginatedFiados> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<PaginatedFiados>(`${this.apiUrl}/resumo`, { params });
  }

  getDetalhes(clienteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clienteId}/detalhes`);
  }

  baixarConta(contaId: number): Observable<any> {
    // Reusing the financeiro endpoint to pay a debt
    return this.http.post<any>(`${environment.apiUrl}/financeiro/contas-receber/${contaId}/baixar`, {});
  }
}
