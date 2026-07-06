import { NexaSelectComponent } from '../../../shared/components/nexa-select/nexa-select.component';
import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Orcamento } from '../services/orcamentos.service';
import { Produto, ProdutosService } from '../../produtos/services/produtos.service';
import { Cliente, ClientesService } from '../../clientes/services/clientes.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface OrcamentoDialogData {
  orcamento?: Orcamento;
}

@Component({
  selector: 'app-orcamento-dialog',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './orcamento-dialog.component.html',
  styleUrl: '../../vendas/dialogs/venda-dialog.component.css' // Reuse premium split POS stylesheet!
})
export class OrcamentoDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  clientes: Cliente[] = [];
  produtos: Produto[] = [];

  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrcamentoDialogComponent>,
    private produtosService: ProdutosService,
    private clientesService: ClientesService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: OrcamentoDialogData,
  ) {
    // Default validade to 7 days from now
    const defVal = new Date();
    defVal.setDate(defVal.getDate() + 7);
    const validadeStr = data.orcamento ? new Date(data.orcamento.validade).toISOString().split('T')[0] : defVal.toISOString().split('T')[0];

    this.form = this.fb.group({
      clienteId: [data.orcamento?.clienteId ?? null],
      validade: [validadeStr, [Validators.required]],
      valorFrete: [data.orcamento ? Number(data.orcamento.valorFrete) : 0],
      valorDesconto: [data.orcamento ? Number(data.orcamento.valorDesconto) : 0],
      observacoes: [data.orcamento?.observacoes ?? ''],
      itens: this.fb.array([]),
    });

    // Populate existing items if editing
    if (data.orcamento?.itens) {
      data.orcamento.itens.forEach((item) => this.addItem(item));
    }
  }

  ngAfterViewInit(): void {
    // Autofocus barcode input
    setTimeout(() => {
      if (this.barcodeInput) {
        this.barcodeInput.nativeElement.focus();
      }
    }, 350);
  }

  ngOnInit(): void {
    this.clientesService.findAll(1, 200).subscribe({
      next: (res) => this.clientes = res.data,
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
      quantidade: [item?.quantidade ?? 1, [Validators.required, Validators.min(0.001)]],
      unidade: [item?.unidade ?? 'UN', [Validators.required]],
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
        unidade: prod.unidadeVenda ?? prod.unidade ?? 'UN'
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

  barcodeSearchTerm = '';

  onBarcodeScan(event: Event): void {
    event.preventDefault();
    const term = this.barcodeSearchTerm?.trim();
    if (!term) return;

    const prod = this.produtos.find((p) => p.sku === term || p.codigoBarras === term);

    if (prod) {
      let foundIndex = -1;
      for (let i = 0; i < this.itens.length; i++) {
        if (this.itens.at(i).get('produtoId')?.value === prod.id) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex > -1) {
        const itemGroup = this.getItemGroup(foundIndex);
        const currentQty = itemGroup.get('quantidade')?.value ?? 0;
        itemGroup.patchValue({ quantidade: currentQty + 1 });
        this.snackBar.open(`Adicionada +1 unidade de "${prod.nome}"`, 'OK', { duration: 2000 });
      } else {
        this.addItem({
          produtoId: prod.id,
          quantidade: 1,
          unidade: prod.unidadeVenda ?? prod.unidade ?? 'UN',
          valorUnitario: Number(prod.precoVenda),
          valorDesconto: 0,
        });
        this.snackBar.open(`"${prod.nome}" adicionado ao orçamento!`, 'OK', { duration: 2000 });
      }
    } else {
      this.snackBar.open(`Produto com Código/SKU "${term}" não encontrado!`, 'Fechar', { duration: 3000 });
    }

    this.barcodeSearchTerm = '';
  }
}
