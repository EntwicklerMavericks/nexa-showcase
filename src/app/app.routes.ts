import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { planGuard } from './core/auth/guards/plan.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'STARTER', featureName: 'Dashboard Interativo', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'categorias',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'] },
        loadComponent: () =>
          import('./features/categorias/categorias.component').then(
            (m) => m.CategoriasComponent,
          ),
      },
      {
        path: 'produtos',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR', 'CAIXA'] },
        loadComponent: () =>
          import('./features/produtos/produtos.component').then(
            (m) => m.ProdutosComponent,
          ),
      },
      {
        path: 'estoque',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'] },
        loadComponent: () =>
          import('./features/estoque/estoque.component').then(
            (m) => m.EstoqueComponent,
          ),
      },
      {
        path: 'usuarios',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'STARTER', featureName: 'Gestão de Usuários', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        loadComponent: () =>
          import('./features/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent,
          ),
      },
      {
        path: 'nfe',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Emissão Fiscal (NF-e/NFC-e)', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        loadComponent: () =>
          import('./features/nfe/nfe.component').then(
            (m) => m.NfeComponent,
          ),
      },
      {
        path: 'clientes',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'STARTER', featureName: 'Gestão de Clientes', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR', 'CAIXA'] },
        loadComponent: () =>
          import('./features/clientes/clientes.component').then(
            (m) => m.ClientesComponent,
          ),
      },
      {
        path: 'vendas',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR', 'CAIXA'] },
        loadComponent: () =>
          import('./features/vendas/vendas.component').then(
            (m) => m.VendasComponent,
          ),
      },
      {
        path: 'fiados',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Módulo de Fiado', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'] },
        loadComponent: () =>
          import('./features/fiados/fiados-lista.component').then(
            (m) => m.FiadosListaComponent,
          ),
      },
      {
        path: 'orcamentos',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Orçamentos', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'] },
        loadComponent: () =>
          import('./features/orcamentos/orcamentos.component').then(
            (m) => m.OrcamentosComponent,
          ),
      },
      {
        path: 'fornecedores',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Gestão de Fornecedores', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        loadComponent: () =>
          import('./features/fornecedores/fornecedores.component').then(
            (m) => m.FornecedoresComponent,
          ),
      },
      {
        path: 'compras',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Gestão de Compras', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        loadComponent: () =>
          import('./features/compras/compras.component').then(
            (m) => m.ComprasComponent,
          ),
      },
      {
        path: 'financeiro',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'STARTER', featureName: 'Gestão Financeira', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CAIXA'] },
        loadComponent: () =>
          import('./features/financeiro/financeiro.component').then(
            (m) => m.FinanceiroComponent,
          ),
      },
      {
        path: 'relatorios',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Relatórios DRE', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        loadComponent: () =>
          import('./features/relatorios/relatorios.component').then(
            (m) => m.RelatoriosComponent,
          ),
      },
      {
        path: 'logistica',
        canActivate: [planGuard, roleGuard],
        data: { requiredPlan: 'PRO', featureName: 'Gestão de Logística', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'] },
        loadComponent: () =>
          import('./features/logistica/logistica.component').then(
            (m) => m.LogisticaComponent,
          ),
      },
      {
        path: 'assinatura',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard/assinatura/assinatura.component').then(
            (m) => m.AssinaturaComponent,
          ),
      },
      {
        path: 'empresas',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/empresas/empresas.component').then(
            (m) => m.EmpresasComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
