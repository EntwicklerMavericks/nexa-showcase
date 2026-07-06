import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Component, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { EmpresasService } from '../../features/empresas/services/empresas.service';
import { MenuNotificationService } from './services/menu-notification.service';
import { PerfilDialogComponent } from '../../features/usuarios/dialogs/perfil-dialog.component';

interface NavItem { 
  label: string; 
  icon: string; 
  route: string; 
  roles?: string[]; 
  plans?: string[];
  active: boolean; 
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatDividerModule, MatDialogModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  readonly sidebarCollapsed = signal(false);
  readonly pageTitle = signal('Dashboard');
  readonly isMobile = signal(false);
  readonly isDarkMode = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'], plans: ['STARTER', 'PRO', 'PREMIUM'], active: true },
    { label: 'Produtos', icon: 'inventory_2', route: '/produtos', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR', 'CAIXA'], active: true },
    { label: 'Categorias', icon: 'category', route: '/categorias', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'], active: true },
    { label: 'Estoque', icon: 'warehouse', route: '/estoque', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'], active: true },
    { label: 'Notas Fiscais', icon: 'receipt_long', route: '/nfe', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Clientes', icon: 'people', route: '/clientes', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR', 'CAIXA'], plans: ['STARTER', 'PRO', 'PREMIUM'], active: true },
    { label: 'Fiados / Caderneta', icon: 'book', route: '/fiados', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Fornecedores', icon: 'local_shipping', route: '/fornecedores', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Compras', icon: 'shopping_cart', route: '/compras', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Vendas', icon: 'point_of_sale', route: '/vendas', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR', 'CAIXA'], active: true },
    { label: 'Logística', icon: 'local_shipping', route: '/logistica', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Orçamentos', icon: 'description', route: '/orcamentos', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VENDEDOR'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Financeiro', icon: 'account_balance', route: '/financeiro', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CAIXA'], plans: ['STARTER', 'PRO', 'PREMIUM'], active: true },
    { label: 'Relatórios', icon: 'assessment', route: '/relatorios', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'], plans: ['PRO', 'PREMIUM'], active: true },
    { label: 'Usuários', icon: 'group', route: '/usuarios', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'], plans: ['STARTER', 'PRO', 'PREMIUM'], active: true },
    { label: 'Empresas', icon: 'business', route: '/empresas', roles: ['SUPER_ADMIN', 'ADMIN'], active: true },
  ];

  readonly empresaLogo;

  constructor(
    public authService: AuthService,
    private readonly empresasService: EmpresasService,
    public readonly notificationService: MenuNotificationService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {
    this.empresaLogo = this.empresasService.activeLogo;

    // Set initial title based on current URL
    const initialUrl = this.router.url;
    const initialItem = this.navItems.find(item => initialUrl.includes(item.route));
    if (initialItem) {
      this.pageTitle.set(initialItem.label);
    }

    // Subscribe to future navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const activeItem = this.navItems.find(item => url.includes(item.route));
      if (activeItem) {
        this.pageTitle.set(activeItem.label);
      }
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadActiveCompanyLogo();
    this.loadTheme();
  }

  private loadTheme(): void {
    const saved = localStorage.getItem('nexa-theme') ?? 'dark';
    const isDark = saved === 'dark';
    this.isDarkMode.set(isDark);
    if (!isDark) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update((dark) => {
      const newVal = !dark;
      if (newVal) {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('nexa-theme', 'dark');
      } else {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('nexa-theme', 'light');
      }
      return newVal;
    });
  }

  private loadActiveCompanyLogo(): void {
    const user = this.authService.currentUser();
    if (user && user.empresaId) {
      this.empresasService.findOne(user.empresaId).subscribe({
        next: (empresa) => {
          if (empresa && empresa.logo) {
            this.empresasService.activeLogo.set(empresa.logo);
          }
        },
        error: (err) => {
          console.error('Error loading logo for layout:', err);
        }
      });
    }
  }

  getNotificationCount(item: NavItem): number {
    return this.notificationService.counts()[item.label] || 0;
  }

  getNotificationTooltip(item: NavItem): string {
    const count = this.getNotificationCount(item);
    if (count <= 0) return item.label;
    if (item.label === 'Estoque') return `${item.label} (${count} itens em alerta)`;
    if (item.label === 'Logística') return `${item.label} (${count} entregas pendentes)`;
    return `${item.label} (${count} alertas)`;
  }

  @HostListener('window:resize')
  onResize(): void { this.checkScreenSize(); }

  private checkScreenSize(): void {
    const mobile = window.innerWidth <= 1024;
    this.isMobile.set(mobile);
    if (mobile) this.sidebarCollapsed.set(true);
  }

  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }
  onNavClick(): void { if (this.isMobile()) this.sidebarCollapsed.set(true); }
  userInitial(): string { return this.authService.currentUser()?.nome?.charAt(0).toUpperCase() ?? 'U'; }

  hasAccess(item: NavItem): boolean {
    if (item.plans && item.plans.length > 0) {
      const userPlan = this.authService.currentUser()?.plano;
      if (!userPlan || !item.plans.includes(userPlan)) {
        if (this.authService.currentUser()?.role !== 'SUPER_ADMIN') {
          return false;
        }
      }
    }
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasRole(...item.roles);
  }

  openPerfilDialog(): void {
    this.dialog.open(PerfilDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
    });
  }
}
