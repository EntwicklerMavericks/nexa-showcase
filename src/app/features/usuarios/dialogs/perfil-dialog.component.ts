import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuariosService, Usuario } from '../services/usuarios.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-perfil-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './perfil-dialog.component.html',
  styles: [`
    .avatar-upload-container {
      cursor: pointer;
    }
    .avatar-hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .avatar-upload-container:hover .avatar-hover-overlay {
      opacity: 1;
    }
  `]
})
export class PerfilDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  usuarioInfo: any = null;
  showPasswordFields = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<PerfilDialogComponent>,
    private readonly usuariosService: UsuariosService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.minLength(6)]],
      confirmarSenha: [''],
      avatarUrl: [''],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('senha')?.value;
    const confirmPassword = g.get('confirmarSenha')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.loading = true;
    this.usuariosService.getProfile().subscribe({
      next: (usuario) => {
        this.usuarioInfo = usuario;
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          avatarUrl: usuario.avatarUrl || '',
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.snackBar.open('Erro ao carregar perfil', 'Fechar', { duration: 3000 });
        this.loading = false;
        this.dialogRef.close();
      }
    });
  }

  get canChangePassword(): boolean {
    if (!this.usuarioInfo?.role) return false;
    return ['SUPER_ADMIN', 'ADMIN', 'GERENTE'].includes(this.usuarioInfo.role);
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.form.patchValue({ senha: '', confirmarSenha: '' });
      this.form.get('senha')?.markAsUntouched();
      this.form.get('confirmarSenha')?.markAsUntouched();
    }
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Administrador',
      GERENTE: 'Gerente',
      VENDEDOR: 'Vendedor',
      CAIXA: 'Caixa',
    };
    return map[role] || role;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        this.snackBar.open('A imagem deve ter no máximo 2MB.', 'Fechar', { duration: 3000 });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.form.patchValue({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  removeFoto(): void {
    this.form.patchValue({ avatarUrl: '' });
  }

  abrirFoto(): void {
    const avatarUrl = this.form.get('avatarUrl')?.value;
    if (avatarUrl) {
      const w = window.open('');
      if (w) {
        w.document.title = 'Foto de Perfil';
        w.document.write(`
          <body style="margin: 0; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; height: 100vh;">
            <img src="${avatarUrl}" style="max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
          </body>
        `);
      }
    }
  }

  onSave(): void {
    if (this.form.valid && this.usuarioInfo) {
      this.loading = true;
      const val = { ...this.form.value };
      delete val.confirmarSenha;

      if (!val.senha) {
        delete val.senha;
      }

      this.usuariosService.update(this.usuarioInfo.id, val).subscribe({
        next: (updatedUser) => {
          this.snackBar.open('Perfil atualizado com sucesso!', 'OK', { duration: 3000 });
          
          // Update the logged in user in AuthService so layout displays correct name/email
          const current = this.authService.currentUser();
          if (current) {
            const newUser = {
              ...current,
              nome: updatedUser.nome,
              email: updatedUser.email,
              avatarUrl: updatedUser.avatarUrl
            };
            this.authService.currentUser.set(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
          }

          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erro ao salvar perfil', 'Fechar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}
