import { NexaSelectComponent } from '../../../shared/components/nexa-select/nexa-select.component';
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotaFiscal } from '../services/nfe.service';
import { Produto } from '../../produtos/services/produtos.service';
import { ProdutosService } from '../../produtos/services/produtos.service';
import { NgxMaskDirective } from 'ngx-mask';

export interface NfeDialogData { nfe?: NotaFiscal; }

@Component({
  selector: 'app-nfe-dialog',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatTabsModule, MatTooltipModule, NgxMaskDirective],
  templateUrl: './nfe-dialog.component.html',
})
export class NfeDialogComponent implements OnInit {
  form: FormGroup;
  produtos: Produto[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NfeDialogComponent>,
    private produtosService: ProdutosService,
    @Inject(MAT_DIALOG_DATA) public data: NfeDialogData,
  ) {
    this.form = this.fb.group({
      naturezaOperacao: [data.nfe?.naturezaOperacao ?? 'Venda de Mercadoria', [Validators.required, Validators.maxLength(255)]],
      tipoOperacao: [data.nfe?.tipoOperacao ?? 'SAIDA', [Validators.required]],
      serie: [data.nfe?.serie ?? 1, [Validators.required, Validators.min(1)]],
      destinatarioNome: [data.nfe?.destinatarioNome ?? '', [Validators.required, Validators.maxLength(255)]],
      destinatarioCpfCnpj: [data.nfe?.destinatarioCpfCnpj ?? '', [Validators.required, Validators.maxLength(18)]],
      observacoes: [data.nfe?.observacoes ?? ''],
      valorFrete: [data.nfe ? Number(data.nfe.valorFrete) : 0],
      valorDesconto: [data.nfe ? Number(data.nfe.valorDesconto) : 0],
      itens: this.fb.array([]),
    });

    // Pre-populate items if editing
    if (data.nfe?.itens) {
      data.nfe.itens.forEach((item) => this.addItem(item));
    }
  }

  ngOnInit(): void {
    this.produtosService.findAll(1, 200).subscribe({
      next: (res) => this.produtos = res.data,
    });
  }

  get itens(): FormArray { return this.form.get('itens') as FormArray; }

  getItemGroup(index: number): FormGroup { return this.itens.at(index) as FormGroup; }

  addItem(item?: any): void {
    this.itens.push(this.fb.group({
      produtoId: [item?.produtoId ?? null, [Validators.required]],
      quantidade: [item?.quantidade ?? 1, [Validators.required, Validators.min(1)]],
      valorUnitario: [item ? Number(item.valorUnitario) : 0, [Validators.required, Validators.min(0.01)]],
      valorDesconto: [item ? Number(item.valorDesconto) : 0],
    }));
  }

  removeItem(index: number): void { this.itens.removeAt(index); }

  onProdutoChange(produtoId: number, index: number): void {
    const prod = this.produtos.find((p) => p.id === produtoId);
    if (prod) {
      const itemGroup = this.getItemGroup(index);
      itemGroup.patchValue({
        valorUnitario: Number(prod.precoVenda),
      });
    }
  }

  calcularSubtotal(): number {
    return this.itens.controls.reduce((sum, ctrl) => {
      const g = ctrl as FormGroup;
      const qty = g.get('quantidade')?.value ?? 0;
      const price = g.get('valorUnitario')?.value ?? 0;
      const desc = g.get('valorDesconto')?.value ?? 0;
      return sum + (qty * price - desc);
    }, 0);
  }

  calcularTotal(): number {
    const sub = this.calcularSubtotal();
    const desc = this.form.get('valorDesconto')?.value ?? 0;
    const frete = this.form.get('valorFrete')?.value ?? 0;
    return sub - desc + frete;
  }

  onSave(): void {
    if (this.form.valid && this.itens.length > 0) {
      this.dialogRef.close(this.form.value);
    }
  }
}
