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
import { Compra } from '../services/compras.service';
import { Produto, ProdutosService } from '../../produtos/services/produtos.service';
import { Fornecedor, FornecedoresService } from '../../fornecedores/services/fornecedores.service';

export interface CompraDialogData { compra?: Compra; }

@Component({
  selector: 'app-compra-dialog',
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
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './compra-dialog.component.html',
})
export class CompraDialogComponent implements OnInit {
  form: FormGroup;
  fornecedores: Fornecedor[] = [];
  produtos: Produto[] = [];

  readonly formasPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CARTAO_CREDITO', label: 'Cartão Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão Débito' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'TRANSFERENCIA', label: 'Transferência' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompraDialogComponent>,
    private produtosService: ProdutosService,
    private fornecedoresService: FornecedoresService,
    @Inject(MAT_DIALOG_DATA) public data: CompraDialogData,
  ) {
    this.form = this.fb.group({
      fornecedorId: [data.compra?.fornecedorId ?? null, [Validators.required]],
      formaPagamento: [data.compra?.formaPagamento ?? 'DINHEIRO', [Validators.required]],
      parcelas: [data.compra?.parcelas ?? 1, [Validators.required, Validators.min(1)]],
      valorFrete: [data.compra ? Number(data.compra.valorFrete) : 0],
      valorDesconto: [data.compra ? Number(data.compra.valorDesconto) : 0],
      observacoes: [data.compra?.observacoes ?? ''],
      itens: this.fb.array([]),
    });

    if (data.compra?.itens) {
      data.compra.itens.forEach((item) => this.addItem(item));
    }
  }

  ngOnInit(): void {
    this.fornecedoresService.findAll(1, 200).subscribe({
      next: (res) => this.fornecedores = res.data,
    });
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
      itemGroup.patchValue({ valorUnitario: Number(prod.precoCusto) });
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
