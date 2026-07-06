import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Produto } from '../../../features/produtos/services/produtos.service';
import { Cliente } from '../../../features/clientes/services/clientes.service';

export interface OutboxVenda {
  id?: number;
  localId: string;
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'ERROR';
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class NexaDBService extends Dexie {
  produtos!: Table<Produto, number>;
  clientes!: Table<Cliente, number>;
  outboxVendas!: Table<OutboxVenda, number>;

  constructor() {
    super('NexaOfflineDB');

    // Esquema do Banco Local (Apenas campos indexados precisam ser definidos aqui)
    this.version(1).stores({
      produtos: 'id, nome, sku, codigoBarras, categoriaId',
      clientes: 'id, nome, cpfCnpj',
      outboxVendas: '++id, localId, status, createdAt' // ++id = Auto-increment
    });

    this.on('populate', () => {
      console.log('NexaOfflineDB populado / criado.');
    });
  }
}
