import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <!-- Background particles effect -->
      <div class="bg-particles">
        @for (i of particles; track i) {
          <div class="particle" [style.--delay]="i * 0.5 + 's'" [style.--x]="(i * 17) % 100 + '%'"></div>
        }
      </div>

      <!-- Login Card -->
      <div class="login-card nexa-fade-in">
        <!-- Header -->
        <div class="login-header">
          <div class="logo-container">
            <img src="/assets/images/logo.png" alt="NEXA Logo" class="project-logo" />
          </div>
          <p class="subtitle">Sistema de Gestão Empresarial</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" class="login-form">
          <!-- Demo Credentials Banner -->
          <div class="demo-credentials-banner" style="background: rgba(248, 148, 24, 0.08); border: 1px dashed var(--nexa-primary); padding: 12px; border-radius: var(--nexa-radius); text-align: center; margin-bottom: 16px;">
            <div style="font-weight: 600; color: var(--nexa-primary); margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9rem;">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px; vertical-align: middle;">vpn_key</mat-icon>
              Acesso Demonstrativo (Pleno)
            </div>
            <div style="font-size: 0.85rem; color: var(--nexa-text-secondary);">
              E-mail: <strong style="color: #fff; font-family: monospace;">demo@nexa.com</strong> | 
              Senha: <strong style="color: #fff; font-family: monospace;">demo123</strong>
            </div>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>E-mail</mat-label>
            <input
              matInput
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              id="login-email"
              autocomplete="email"
            />
            <mat-icon matPrefix>mail</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Senha</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              [(ngModel)]="senha"
              name="senha"
              required
              id="login-password"
              autocomplete="current-password"
            />
            <mat-icon matPrefix>lock</mat-icon>
            <button
              mat-icon-button
              matSuffix
              (click)="hidePassword.update(v => !v)"
              type="button"
            >
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (errorMsg()) {
            <div class="error-msg">
              <mat-icon>error</mat-icon>
              {{ errorMsg() }}
            </div>
          }

          <button
            mat-flat-button
            class="login-btn"
            type="submit"
            [disabled]="loading() || !email || !senha"
            id="login-submit"
          >
            @if (loading()) {
              <mat-spinner diameter="20" color="primary"></mat-spinner>
            } @else {
              Entrar
            }
          </button>
        </form>

        <!-- Register Link -->
        <div style="text-align: center; margin-top: 24px; margin-bottom: 8px; font-size: 0.95rem;">
          <span style="color: var(--nexa-text-muted);">Não possui uma assinatura?</span>
          <br>
          <a href="https://nexa-frontend-landing.eduardotheodorofegit.workers.dev/#pricing" style="color: var(--nexa-primary); text-decoration: none; font-weight: 600; margin-top: 4px; display: inline-block; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Conheça nossos planos e comece grátis</a>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <small>Nexa ERP © {{ currentYear }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--nexa-bg);
      position: relative;
      overflow: hidden;
    }

    // ─── Background Animation ───────────────────────────
    .bg-particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--nexa-primary);
      border-radius: 50%;
      opacity: 0.15;
      left: var(--x);
      animation: float 12s ease-in-out infinite;
      animation-delay: var(--delay);
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(100vh) scale(0);
        opacity: 0;
      }
      10% {
        opacity: 0.3;
      }
      50% {
        opacity: 0.15;
        transform: translateY(50vh) scale(1);
      }
      90% {
        opacity: 0;
      }
    }

    // ─── Card ───────────────────────────────────────────
    .login-card {
      width: 100%;
      max-width: 420px;
      background: var(--nexa-bg-card);
      border: 1px solid var(--nexa-border);
      border-radius: var(--nexa-radius-xl);
      padding: 40px;
      position: relative;
      z-index: 1;
      box-shadow:
        0 0 60px rgba(248, 148, 24, 0.05),
        0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .project-logo {
      height: 96px; /* Enlarged for premium branding and presence */
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 0 20px rgba(248, 148, 24, 0.45));
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 4px;
      margin: 0;
    }

    .subtitle {
      color: var(--nexa-text-secondary);
      font-size: 14px;
      margin: 0;
    }

    // ─── Form ───────────────────────────────────────────
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--nexa-danger);
      font-size: 13px;
      padding: 8px 12px;
      background: rgba(248, 113, 113, 0.1);
      border-radius: var(--nexa-radius);
      margin-bottom: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .login-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, var(--nexa-primary), var(--nexa-primary-dark)) !important;
      color: #000 !important;
      border-radius: var(--nexa-radius) !important;
      transition: all var(--nexa-transition);

      &:hover:not(:disabled) {
        box-shadow: 0 4px 20px var(--nexa-primary-glow);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.5;
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: var(--nexa-text-muted);
    }
  `],
})
export class LoginComponent {
  email = '';
  senha = '';
  readonly loading = signal(false);
  readonly errorMsg = signal('');
  readonly hidePassword = signal(true);
  readonly currentYear = new Date().getFullYear();
  readonly particles = Array.from({ length: 20 }, (_, i) => i);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onLogin(): void {
    if (!this.email || !this.senha) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(this.email, this.senha).subscribe({
      next: (response) => {
        this.authService.handleLoginSuccess(response);
        const user = this.authService.currentUser();
        if (user && user.plano === 'MEI') {
          this.router.navigate(['/vendas']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.error?.message || 'Erro ao realizar login. Tente novamente.',
        );
      },
    });
  }
}
