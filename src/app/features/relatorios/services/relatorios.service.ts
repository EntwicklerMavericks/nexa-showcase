import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private readonly url = `${environment.apiUrl}/relatorios`;

  constructor(private readonly http: HttpClient) {}

  getDre(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<any>(`${this.url}/dre`, { params });
  }

  getTopProdutos(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<any>(`${this.url}/top-produtos`, { params });
  }

  getVendasPeriodo(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<any>(`${this.url}/vendas-periodo`, { params });
  }

  getFluxoCaixa(dataInicio: string, dataFim: string): Observable<any> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<any>(`${this.url}/fluxo-caixa`, { params });
  }

  getDashboardConsolidado(): Observable<any> {
    return this.http.get<any>(`${this.url}/dashboard-consolidado`);
  }
}
