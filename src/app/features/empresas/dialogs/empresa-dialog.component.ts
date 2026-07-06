import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { Empresa } from '../services/empresas.service';

export interface EmpresaDialogData {
  empresa?: Empresa;
}

@Component({
  selector: 'app-empresa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    NgxMaskDirective
  ],
  templateUrl: './empresa-dialog.component.html',
})
export class EmpresaDialogComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<EmpresaDialogComponent>,
    private readonly snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public readonly data: EmpresaDialogData
  ) {
    this.isEdit = !!data.empresa;

    this.form = this.fb.group({
      razaoSocial: [data.empresa?.razaoSocial ?? '', [Validators.required, Validators.maxLength(255)]],
      nomeFantasia: [data.empresa?.nomeFantasia ?? '', [Validators.maxLength(255)]],
      cnpj: [
        data.empresa?.cnpj ? this.formatCNPJ(data.empresa.cnpj) : '', 
        [Validators.required]
      ],
      ie: [data.empresa?.ie ?? '', [Validators.maxLength(20)]],
      telefone: [data.empresa?.telefone ?? '', [Validators.maxLength(20)]],
      email: [data.empresa?.email ?? '', [Validators.email, Validators.maxLength(255)]],
      cep: [data.empresa?.cep ?? '', [Validators.maxLength(10)]],
      endereco: [data.empresa?.endereco ?? '', [Validators.maxLength(500)]],
      cidade: [data.empresa?.cidade ?? '', [Validators.maxLength(100)]],
      estado: [data.empresa?.estado ?? '', [Validators.maxLength(2)]],
      logo: [data.empresa?.logo ?? '', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.form.get('cep')?.valueChanges.subscribe((cepValue) => {
      const cleanedCep = (cepValue || '').replace(/\D/g, '');
      if (cleanedCep.length === 8) {
        this.buscarCep(cleanedCep);
      }
    });
  }

  buscarCep(cep: string): void {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.erro) {
          const logradouro = data.logradouro || '';
          const bairro = data.bairro || '';
          let enderecoCompleto = '';
          if (logradouro) enderecoCompleto += logradouro;
          if (bairro) enderecoCompleto += enderecoCompleto ? `, ${bairro}` : bairro;

          this.form.patchValue({
            cidade: data.localidade || '',
            estado: data.uf || '',
          });

          if (enderecoCompleto) {
            this.form.patchValue({
              endereco: enderecoCompleto,
            });
          }
          this.snackBar.open('CEP localizado e preenchido com sucesso!', 'OK', { duration: 2000 });
        } else {
          this.snackBar.open('CEP não encontrado.', 'Fechar', { duration: 3000 });
        }
      })
      .catch(() => {
        this.snackBar.open('Erro ao buscar o CEP.', 'Fechar', { duration: 3000 });
      });
  }

  onSave(): void {
    if (this.form.valid) {
      const value = { ...this.form.value };
      
      // Strip non-numeric from CNPJ
      value.cnpj = value.cnpj.replace(/\D/g, '');

      this.dialogRef.close(value);
    }
  }

  private formatCNPJ(v: string): string {
    if (!v) return '';
    v = v.replace(/\D/g, '');
    if (v.length > 14) v = v.substring(0, 14);
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
}
