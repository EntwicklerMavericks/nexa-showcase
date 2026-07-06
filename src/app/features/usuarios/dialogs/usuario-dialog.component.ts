import { NexaSelectComponent } from '../../../shared/components/nexa-select/nexa-select.component';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Usuario } from '../services/usuarios.service';

export interface UsuarioDialogData { usuario?: Usuario; }

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './usuario-dialog.component.html',
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
export class UsuarioDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioDialogData,
  ) {
    const isEdit = !!data.usuario;
    this.form = this.fb.group({
      nome: [data.usuario?.nome ?? '', [Validators.required, Validators.maxLength(255)]],
      email: [data.usuario?.email ?? '', [Validators.required, Validators.email]],
      senha: ['', isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      role: [data.usuario?.role ?? 'VENDEDOR', [Validators.required]],
      avatarUrl: [data.usuario?.avatarUrl ?? ''],
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        alert('A imagem deve ter no máximo 2MB.');
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
        w.document.title = 'Foto do Usuário';
        w.document.write(`
          <body style="margin: 0; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; height: 100vh;">
            <img src="${avatarUrl}" style="max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
          </body>
        `);
      }
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const value = { ...this.form.value };
      // Don't send empty password on edit
      if (this.data.usuario && !value.senha) {
        delete value.senha;
      }
      this.dialogRef.close(value);
    }
  }
}
