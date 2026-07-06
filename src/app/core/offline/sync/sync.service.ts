import { Injectable, signal, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NexaDBService, OutboxVenda } from '../db/nexa-db.service';
import { firstValueFrom } from 'rxjs';
import { ProdutosService } from '../../../features/produtos/services/produtos.service';
import { ClientesService } from '../../../features/clientes/services/clientes.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  readonly isOnline = signal<boolean>(navigator.onLine);
  readonly pendingSyncCount = signal<number>(0);
  readonly isSyncing = signal<boolean>(false);

  private apiUrl = `${environment.apiUrl}/vendas`;

  constructor(
    private db: NexaDBService,
    private http: HttpClient,
    private ngZone: NgZone,
    private produtosService: ProdutosService,
    private clientesService: ClientesService
  ) {
    this.initNetworkListeners();
    this.updatePendingCount();
  }

  private initNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.ngZone.run(() => {
        this.isOnline.set(true);
        console.log('[SyncService] Conexão restaurada. Tentando sincronizar outbox...');
        this.syncPendingVendas();
      });
    });

    window.addEventListener('offline', () => {
      this.ngZone.run(() => {
        this.isOnline.set(false);
        console.log('[SyncService] Conexão perdida. Modo Offline Ativado.');
      });
    });
  }

  async updatePendingCount(): Promise<void> {
    const count = await this.db.outboxVendas.where('status').equals('PENDING').count();
    this.ngZone.run(() => this.pendingSyncCount.set(count));
  }

  /**
   * Baixa todo o catálogo (Produtos e Clientes) para o IndexedDB.
   */
  async downloadCatalog(): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('Você está offline. Não é possível baixar o catálogo.');
    }

    this.isSyncing.set(true);
    try {
      // Baixar Produtos
      const produtosRes = await firstValueFrom(this.produtosService.findAll(1, 10000));
      if (produtosRes?.data) {
        await this.db.produtos.clear();
        await this.db.produtos.bulkAdd(produtosRes.data);
      }

      // Baixar Clientes
      const clientesRes = await firstValueFrom(this.clientesService.findAll(1, 10000));
      if (clientesRes?.data) {
        await this.db.clientes.clear();
        await this.db.clientes.bulkAdd(clientesRes.data);
      }

      console.log('[SyncService] Catálogo sincronizado com sucesso.');
    } catch (e) {
      console.error('[SyncService] Erro ao sincronizar catálogo', e);
      throw e;
    } finally {
      this.isSyncing.set(false);
    }
  }

  /**
   * Envia as vendas paradas no IndexedDB para a API.
   */
  async syncPendingVendas(): Promise<void> {
    if (!this.isOnline() || this.isSyncing()) return;

    this.isSyncing.set(true);
    try {
      const pending = await this.db.outboxVendas.where('status').equals('PENDING').toArray();
      
      for (const venda of pending) {
        try {
          // Remover os identificadores locais para não confundir o backend
          const payload = { ...venda.payload };
          
          await firstValueFrom(this.http.post(this.apiUrl, payload));
          
          // Sucesso
          await this.db.outboxVendas.update(venda.id!, { status: 'SYNCED' });
        } catch (error) {
          console.error(`[SyncService] Erro ao sincronizar venda localId: ${venda.localId}`, error);
          if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
            await this.db.outboxVendas.update(venda.id!, { status: 'ERROR' });
          }
        }
      }

      // Limpar sincronizadas antigas
      await this.db.outboxVendas.where('status').equals('SYNCED').delete();

    } finally {
      await this.updatePendingCount();
      this.isSyncing.set(false);
    }
  }
}
