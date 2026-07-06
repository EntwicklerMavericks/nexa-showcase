import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuariosService, Usuario } from './services/usuarios.service';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioDialogComponent } from './dialogs/usuario-dialog.component';
import { UpgradeOverlayComponent } from '../../shared/components/upgrade-overlay/upgrade-overlay.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { NexaDataTableComponent, ColumnConfig, NexaCustomCellDirective } from '../../shared/components/data-table/nexa-data-table.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatTooltipModule, MatSnackBarModule, NexaDataTableComponent, NexaCustomCellDirective],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  readonly usuarios = signal<Usuario[]>([]);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly loading = signal(false);

  readonly columns: ColumnConfig[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail', hideOnMobile: true },
    { key: 'role', label: 'Perfil' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Criado em', hideOnMobile: true },
    { key: 'acoes', label: 'Ações' }
  ];
  private searchSubject = new Subject<string>();

  constructor(
    private usuariosService: UsuariosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private confirmService: ConfirmDialogService,
  ) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term); this.currentPage.set(1); this.loadData();
    });
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.usuariosService.findAll(this.currentPage(), this.pageSize(), this.searchTerm() || undefined).subscribe({
      next: (res) => {
        this.usuarios.set(res.data);
        this.totalRecords.set(res.meta?.total ?? res.data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Usuarios API Error:', err);
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar usuários', 'Fechar', { duration: 3000 });
      },
    });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex + 1); this.pageSize.set(event.pageSize); this.loadData(); }

  get isLimitReached(): boolean {
    const plan = this.authService.currentUser()?.plano;
    let limit = 999;
    if (plan === 'STARTER') limit = 2;
    if (plan === 'PRO') limit = 10;
    
    const activeCount = this.usuarios().filter(u => u.ativo).length;
    // se o backend retornar o total de ativos, poderiamos usar this.totalRecords(), 
    // mas aqui limitamos visualmente pelo que está na tela (que atende o básico)
    return activeCount >= limit && this.authService.currentUser()?.role !== 'SUPER_ADMIN';
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'role-super', ADMIN: 'role-admin', GERENTE: 'role-gerente', VENDEDOR: 'role-vendedor', CAIXA: 'role-caixa',
    };
    return map[role] || '';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrador', GERENTE: 'Gerente', VENDEDOR: 'Vendedor', CAIXA: 'Caixa',
    };
    return map[role] || role;
  }

  openDialog(usuario?: Usuario): void {
    if (!usuario && this.isLimitReached) {
      this.dialog.open(UpgradeOverlayComponent, {
        data: { requiredPlan: 'PRO', feature: 'Adicionar mais usuários (Limite atingido)' },
        width: '450px',
        maxWidth: '95vw',
        panelClass: 'upgrade-dialog-panel'
      });
      return;
    }

    const ref = this.dialog.open(UsuarioDialogComponent, { data: { usuario }, width: '550px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = usuario ? this.usuariosService.update(usuario.id, result) : this.usuariosService.create(result);
      obs.subscribe({
        next: () => { this.snackBar.open(usuario ? 'Usuário atualizado!' : 'Usuário criado!', 'OK', { duration: 3000 }); this.loadData(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao salvar', 'Fechar', { duration: 3000 }),
      });
    });
  }

  onRemove(usuario: Usuario): void {
    this.confirmService.confirm({
      title: 'Desativar Usuário',
      message: `Desativar "${usuario.nome}"?`,
      confirmText: 'Desativar',
      isDanger: true,
    }).subscribe(res => {
      if (res) {
        this.usuariosService.remove(usuario.id).subscribe({
          next: () => { this.snackBar.open('Usuário desativado', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro ao desativar', 'Fechar', { duration: 3000 }),
        });
      }
    });
  }
}
