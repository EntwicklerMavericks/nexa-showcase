import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './assinatura.component.html',
  styleUrls: ['./assinatura.component.css'],
})
export class AssinaturaComponent implements OnInit {
  currentPlan = signal<'STARTER' | 'PRO' | 'PREMIUM'>('STARTER');
  isUpgrading = signal(false);

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userPlan = this.authService.currentUser()?.plano || 'STARTER';
    this.currentPlan.set(userPlan as 'STARTER' | 'PRO' | 'PREMIUM');
  }

  upgradeTo(plan: 'PRO' | 'PREMIUM') {
    this.isUpgrading.set(true);
    // Simular chamada de API de upgrade
    this.http.put(`${environment.apiUrl}/empresas/plano`, { plan }).subscribe({
      next: () => {
        this.isUpgrading.set(false);
        this.currentPlan.set(plan);
        this.authService.updateUserPlan(plan);
        this.snackBar.open(`Parabéns! Seu plano foi atualizado para ${plan}.`, 'OK', { duration: 5000 });
      },
      error: () => {
        this.isUpgrading.set(false);
        this.snackBar.open('Erro ao atualizar plano. Tente novamente.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
