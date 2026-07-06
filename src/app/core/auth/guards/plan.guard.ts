import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { UpgradeOverlayComponent } from '../../../shared/components/upgrade-overlay/upgrade-overlay.component';

export const planGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  const requiredPlan = route.data['requiredPlan'] as string | undefined;

  if (!requiredPlan) {
    return true;
  }

  const user = authService.currentUser();
  if (user && user.role === 'SUPER_ADMIN') {
    return true;
  }

  const userPlan = user?.plano || 'STARTER';

  const planHierarchy = ['STARTER', 'PRO', 'PREMIUM'];
  const userPlanIndex = planHierarchy.indexOf(userPlan.toUpperCase());
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan.toUpperCase());

  if (userPlanIndex < requiredPlanIndex) {
    // Open the upgrade overlay dialog instead of just redirecting
    dialog.open(UpgradeOverlayComponent, {
      width: '450px',
      data: { requiredPlan, feature: route.data['featureName'] || 'este recurso' },
      panelClass: 'upgrade-dialog'
    });
    
    // Returning false prevents navigation.
    // The user stays on the current page while the dialog is open.
    return false;
  }

  return true;
};
