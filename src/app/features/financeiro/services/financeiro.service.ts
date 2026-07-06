import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly url = `${environment.apiUrl}/financeiro`;

  constructor(private readonly http: HttpClient) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.url}/dashboard`);
  }

  // ── Contas a Receber ───────────────────────────────────────────────────────
  getContasReceber(page = 1, limit = 20, status?: string, dataInicio?: string, dataFim?: string, clienteId?: number, vendaId?: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);
    if (clienteId) params = params.set('clienteId', clienteId.toString());
    if (vendaId) params = params.set('vendaId', vendaId.toString());
    return this.http.get<any>(`${this.url}/receber`, { params });
  }

  createContaReceber(data: any): Observable<any> {
    return this.http.post<any>(`${this.url}/receber`, data);
  }

  baixarReceber(id: number, dto?: any): Observable<any> {
    return this.http.patch<any>(`${this.url}/receber/${id}/baixar`, dto || {});
  }

  estornarReceber(id: number): Observable<any> {
    return this.http.patch<any>(`${this.url}/receber/${id}/estornar`, {});
  }

  removeReceber(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/receber/${id}`);
  }

  // ── Contas a Pagar ─────────────────────────────────────────────────────────
  getContasPagar(page = 1, limit = 20, status?: string, dataInicio?: string, dataFim?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);
    return this.http.get<any>(`${this.url}/pagar`, { params });
  }

  createContaPagar(data: any): Observable<any> {
    return this.http.post<any>(`${this.url}/pagar`, data);
  }

  baixarPagar(id: number, dto?: any): Observable<any> {
    return this.http.patch<any>(`${this.url}/pagar/${id}/baixar`, dto || {});
  }

  estornarPagar(id: number): Observable<any> {
    return this.http.patch<any>(`${this.url}/pagar/${id}/estornar`, {});
  }

  removePagar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/pagar/${id}`);
  }
}
