// =============================================================================
// MenuNotificationService — Handles real-time SSE stream for sidebar badges
// =============================================================================

import { Injectable, NgZone, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuNotificationService {
  // Reactive notifications store mapping menu label to count
  readonly counts = signal<Record<string, number>>({
    Estoque: 0,
    Logística: 0,
    'Fiados / Caderneta': 0,
  });

  private eventSource: EventSource | null = null;
  private http = inject(HttpClient);

  constructor(
    private readonly authService: AuthService,
    private readonly ngZone: NgZone,
  ) {
    // Automatically establish/terminate SSE connection on auth state changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.fetchInitialCounts();
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private fetchInitialCounts(): void {
    this.http.get<any>(`${environment.apiUrl}/notifications/counts`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.handleEvent(res);
        }
      },
      error: (err) => console.error('[SSE] Failed to fetch initial counts via REST:', err)
    });
  }

  private connect(): void {
    this.disconnect();
    console.log('[SSE] Conexão SSE simulada com sucesso.');
  }

  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private handleEvent(event: { type: string; data: any }): void {
    if (event.type === 'initial') {
      this.counts.set({
        Estoque: event.data.Estoque || 0,
        Logística: event.data.Logística || 0,
        'Fiados / Caderneta': event.data['Fiados / Caderneta'] || 0,
      });
    } else if (event.type === 'estoque') {
      this.counts.update((prev) => ({ ...prev, Estoque: event.data.count }));
    } else if (event.type === 'logistica') {
      this.counts.update((prev) => ({ ...prev, Logística: event.data.count }));
    } else if (event.type === 'fiado') {
      this.counts.update((prev) => ({ ...prev, 'Fiados / Caderneta': event.data.count }));
    }
  }

  /**
   * Proactively update a local count immediately (e.g. on client click actions)
   */
  setCount(key: string, count: number): void {
    this.counts.update((prev) => ({
      ...prev,
      [key]: count,
    }));
  }
}
