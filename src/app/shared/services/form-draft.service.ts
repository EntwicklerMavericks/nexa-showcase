import { Injectable } from '@angular/core';

export interface FormDraft<T = any> {
  timestamp: number;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class FormDraftService {
  /**
   * Salva o estado atual do formulário no LocalStorage.
   * @param key Identificador único para o rascunho (ex: 'produto-form-draft')
   * @param data Objeto com os valores do formulário
   */
  saveDraft<T>(key: string, data: T): void {
    const draft: FormDraft<T> = {
      timestamp: Date.now(),
      data
    };
    try {
      localStorage.setItem(`nexa_draft_${key}`, JSON.stringify(draft));
    } catch (e) {
      console.warn('Erro ao salvar rascunho no LocalStorage', e);
    }
  }

  /**
   * Retorna os dados do rascunho, caso exista.
   * @param key Identificador único do rascunho
   * @param maxAgeHours Idade máxima permitida do rascunho em horas (padrão 24h)
   * @returns Os dados do rascunho ou null se expirar/não existir
   */
  getDraft<T>(key: string, maxAgeHours: number = 24): T | null {
    try {
      const raw = localStorage.getItem(`nexa_draft_${key}`);
      if (!raw) return null;

      const draft: FormDraft<T> = JSON.parse(raw);
      const ageMs = Date.now() - draft.timestamp;
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

      if (ageMs > maxAgeMs) {
        this.clearDraft(key); // Rascunho expirado
        return null;
      }

      return draft.data;
    } catch (e) {
      console.warn('Erro ao ler rascunho do LocalStorage', e);
      return null;
    }
  }

  /**
   * Verifica se existe um rascunho válido (não expirado)
   */
  hasDraft(key: string, maxAgeHours: number = 24): boolean {
    return this.getDraft(key, maxAgeHours) !== null;
  }

  /**
   * Remove o rascunho do LocalStorage. (Ex: Chamado após salvar com sucesso)
   */
  clearDraft(key: string): void {
    try {
      localStorage.removeItem(`nexa_draft_${key}`);
    } catch (e) {
      // Ignorar erros
    }
  }
}
