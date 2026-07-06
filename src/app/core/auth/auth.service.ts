// =============================================================================
// AuthService — Manages authentication state with signals
// =============================================================================

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { map } from 'rxjs';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  empresaId: number | null;
  avatarUrl?: string;
  plano?: 'MEI' | 'STARTER' | 'PRO' | 'PREMIUM';
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state
  readonly currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  checkEmail(email: string) {
    return this.http.get<{exists: boolean}>(`${this.apiUrl}/check-email`, { params: { email } });
  }

  login(email: string, senha: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, senha });
  }

  registerTenant(payload: any) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register-tenant`, payload).pipe(
      map(res => {
        this.handleLoginSuccess(res);
        return res;
      })
    );
  }

  handleLoginSuccess(response: LoginResponse): void {
    const { accessToken, refreshToken, user } = response;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  updateUserPlan(plan: 'MEI' | 'STARTER' | 'PRO' | 'PREMIUM'): void {
    const user = this.currentUser();
    if (user) {
      const updatedUser = { ...user, plano: plan };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUser.set(updatedUser);
    }
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  handleRefreshSuccess(response: RefreshResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  }

  logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        error: () => {}, // Ignore errors on logout
      });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  hasRole(...roles: string[]): boolean {
    const userRole = this.userRole();
    if (!userRole) return false;
    if (userRole === 'SUPER_ADMIN') return true;
    return roles.includes(userRole);
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
