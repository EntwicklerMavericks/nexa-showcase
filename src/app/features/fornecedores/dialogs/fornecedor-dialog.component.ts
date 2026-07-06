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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { Fornecedor } from '../services/fornecedores.service';

export interface FornecedorDialogData { fornecedor?: Fornecedor; }

@Component({
  selector: 'app-fornecedor-dialog',
  standalone: true,
  imports: [NexaSelectComponent, 
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    NgxMaskDirective
  ],
  templateUrl: './fornecedor-dialog.component.html',
})
export class FornecedorDialogComponent {
  form: FormGroup;

  readonly estados = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FornecedorDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: FornecedorDialogData,
  ) {
    const f = data.fornecedor;
    this.form = this.fb.group({
      nome: [f?.nome ?? '', [Validators.required, Validators.maxLength(255)]],
      cpfCnpj: [f?.cpfCnpj ?? '', [Validators.required, Validators.maxLength(18)]],
      tipo: [f?.tipo ?? 'PJ'],
      ie: [f?.ie ?? ''],
      email: [f?.email ?? ''],
      telefone: [f?.telefone ?? ''],
      endereco: [f?.endereco ?? ''],
      cidade: [f?.cidade ?? ''],
      estado: [f?.estado ?? ''],
      cep: [f?.cep ?? ''],
      observacoes: [f?.observacoes ?? ''],
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

  get isPJ(): boolean {
    return this.form.get('tipo')?.value === 'PJ';
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
