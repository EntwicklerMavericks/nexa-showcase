import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const expectedRoles: string[] = route.data?.['roles'];
  const userRole = authService.currentUser()?.role;

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (!expectedRoles || expectedRoles.length === 0) {
    return true; // No roles defined, meaning it's public (for authenticated users)
  }

  if (!userRole || !expectedRoles.includes(userRole)) {
    snackBar.open('Acesso Negado: Você não tem permissão para acessar esta tela.', 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    // Redirect logic depending on role to not keep them in a loop
    if (userRole === 'VENDEDOR' || userRole === 'CAIXA') {
      router.navigate(['/vendas']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }

  return true;
};
