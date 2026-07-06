import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Categoria } from '../services/categorias.service';

export interface CategoriaDialogData { categoria?: Categoria; }

@Component({
  selector: 'app-categoria-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './categoria-dialog.component.html',
})
export class CategoriaDialogComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<CategoriaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoriaDialogData) {
    this.form = this.fb.group({
      nome: [data.categoria?.nome ?? '', [Validators.required, Validators.maxLength(255)]],
      descricao: [data.categoria?.descricao ?? '', [Validators.maxLength(500)]],
    });
  }
  onSave(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}
