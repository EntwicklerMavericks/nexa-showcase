import { NexaSelectComponent } from '../../../shared/components/nexa-select/nexa-select.component';
import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Venda } from '../services/vendas.service';
import { Produto, ProdutosService } from '../../produtos/services/produtos.service';
import { Cliente, ClientesService } from '../../clientes/services/clientes.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProdutoSelectorBottomSheetComponent } from './produto-selector-bottom-sheet.component';

export interface VendaDialogData {
  venda?: Venda;
  preScannedProduct?: Produto;
}

@Component({
  selector: 'app-venda-dialog',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatTabsModule, MatTooltipModule, MatSnackBarModule, MatAutocompleteModule, MatBottomSheetModule],
  templateUrl: './venda-dialog.component.html',
  styleUrl: './venda-dialog.component.css'
})
export class VendaDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  clientes: Cliente[] = [];
  initialProdutos: Produto[] = [];
  produtosCache = new Map<number, any>();
  rowFilteredProdutos: { [index: number]: Produto[] } = {};
  selectedClientDetails: any = null;
  pixPago = false;
  isMobile = window.innerWidth <= 768;

  showEstoqueAlerta = false;
  alertaProdutoNome = '';
  alertaPendingAction: (() => void) | null = null;
  alertaCancelAction: (() => void) | null = null;

  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  readonly formasPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CARTAO_CREDITO', label: 'Cartão Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão Débito' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'TRANSFERENCIA', label: 'Transferência' },
    { value: 'CREDIARIO', label: 'Crediário Próprio' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VendaDialogComponent>,
    private produtosService: ProdutosService,
    private clientesService: ClientesService,
    private snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    private breakpointObserver: BreakpointObserver,
    @Inject(MAT_DIALOG_DATA) public data: VendaDialogData,
  ) {
    this.form = this.fb.group({
      clienteId: [data.venda?.clienteId ?? null],
      formaPagamento: [data.venda?.formaPagamento ?? 'DINHEIRO', [Validators.required]],
      parcelas: [data.venda?.parcelas ?? 1, [Validators.required, Validators.min(1)]],
      valorFrete: [data.venda ? Number(data.venda.valorFrete) : 0],
      valorDesconto: [data.venda ? Number(data.venda.valorDesconto) : 0],
      observacoes: [data.venda?.observacoes ?? ''],
      itens: this.fb.array([]),
    });

    // Pre-popula itens ao editar ou bipe inicial
    if (data.venda?.itens) {
      data.venda.itens.forEach((item) => {
        if (item.produto) {
          this.produtosCache.set(item.produto.id, item.produto);
        }
        this.addItem(item);
      });
    } else if (data.preScannedProduct) {
      this.produtosCache.set(data.preScannedProduct.id, data.preScannedProduct);
      this.addItem({
        produtoId: data.preScannedProduct.id,
        produto: data.preScannedProduct,
        quantidade: 1,
        valorUnitario: Number(data.preScannedProduct.precoVenda),
        valorDesconto: 0,
      });
      
      if (data.preScannedProduct.estoqueAtual <= 0) {
        this.alertaProdutoNome = data.preScannedProduct.nome;
        this.showEstoqueAlerta = true;
        this.alertaPendingAction = () => {
          this.showEstoqueAlerta = false;
        };
        this.alertaCancelAction = () => {
          this.removeItem(0);
          this.showEstoqueAlerta = false;
        };
      }
    }
  }

  ngAfterViewInit(): void {
    // Autofocus no leitor de código de barras ao abrir o diálogo
    setTimeout(() => {
      if (this.barcodeInput) {
        this.barcodeInput.nativeElement.focus();
      }
    }, 350);
  }

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });

    this.clientesService.findAll(1, 200).subscribe({
      next: (res) => this.clientes = res.data,
    });
    
    // Se temos um produto pré-bipado, iniciamos a lista com ele
    if (this.data.preScannedProduct) {
      this.produtosCache.set(this.data.preScannedProduct.id, this.data.preScannedProduct);
    }

    this.produtosService.findAll(1, 10).subscribe({
      next: (res) => {
        this.initialProdutos = res.data;
        res.data.forEach((p: any) => this.produtosCache.set(p.id, p));
      },
    });

    // Escutar alterações do clienteId para atualizar dados financeiros do crediário
    this.form.get('clienteId')?.valueChanges.subscribe((cid) => {
      this.updateCreditInfo(cid);
    });

    // Se inicial (ex: editando)
    const initialCid = this.form.get('clienteId')?.value;
    if (initialCid) {
      this.updateCreditInfo(initialCid);
    }

    // Resetar estado pix se trocar de meio de pagamento
    this.form.get('formaPagamento')?.valueChanges.subscribe((fp) => {
      if (fp !== 'PIX') {
        this.pixPago = false;
      }
    });
  }

  private updateCreditInfo(cid: number | null): void {
    if (cid) {
      this.clientesService.findOne(cid).subscribe({
        next: (client) => {
          this.selectedClientDetails = client;
        },
        error: () => {
          this.selectedClientDetails = null;
        }
      });
    } else {
      this.selectedClientDetails = null;
    }
  }

  get itens(): FormArray { return this.form.get('itens') as FormArray; }
  getItemGroup(index: number): FormGroup { return this.itens.at(index) as FormGroup; }

  addItem(item?: any): void {
    const prod = item?.produto ?? (item?.produtoId ? this.produtosCache.get(item.produtoId) : null);
    this.itens.push(this.fb.group({
      produtoId: [item?.produtoId ?? null, [Validators.required]],
      produtoSearch: [prod ?? '', [Validators.required]],
      quantidade: [item?.quantidade ?? 1, [Validators.required, Validators.min(0.001)]],
      valorUnitario: [item ? Number(item.valorUnitario) : 0, [Validators.required, Validators.min(0.01)]],
      valorDesconto: [item ? Number(item.valorDesconto) : 0],
    }));
  }

  displayFn(produto?: Produto | string | any): string {
    if (typeof produto === 'string') return produto;
    return produto && produto.nome ? produto.nome : '';
  }

  getFilteredProdutos(index: number): Produto[] {
    return this.rowFilteredProdutos[index] || this.initialProdutos || [];
  }

  getItemUnidade(index: number): string {
    const produtoId = this.itens.at(index).get('produtoId')?.value;
    if (!produtoId) return '';
    const prod = this.produtosCache.get(produtoId);
    return prod?.unidade ?? 'UN';
  }

  removeItem(index: number): void { this.itens.removeAt(index); }

  onSearchProduct(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value?.trim();
    if (!term) {
      const itemGroup = this.getItemGroup(index);
      itemGroup.patchValue({ produtoId: null });
      this.rowFilteredProdutos[index] = this.initialProdutos;
      return;
    }

    this.produtosService.findAll(1, 20, term).subscribe({
      next: (res) => {
        this.rowFilteredProdutos[index] = res.data;
        res.data.forEach((p: any) => this.produtosCache.set(p.id, p));
      }
    });
  }

  onProdutoSelected(produto: Produto, index: number): void {
    if (produto.estoqueAtual <= 0) {
      this.alertaProdutoNome = produto.nome;
      this.showEstoqueAlerta = true;
      this.alertaPendingAction = () => {
        this.finishProductSelection(produto, index);
        this.showEstoqueAlerta = false;
      };
      this.alertaCancelAction = () => {
        this.getItemGroup(index).patchValue({ produtoSearch: null, produtoId: null });
        this.showEstoqueAlerta = false;
      };
    } else {
      this.finishProductSelection(produto, index);
    }
  }

  finishProductSelection(produto: Produto, index: number): void {
    const itemGroup = this.getItemGroup(index);
    itemGroup.patchValue({
      produtoId: produto.id,
      produtoSearch: produto,
      valorUnitario: Number(produto.precoVenda)
    });
  }

  abrirSeletorClienteMobile(): void {
    const options = [
      { label: 'Consumidor Final (Sem Cadastro)', value: null },
      ...this.clientes.map(c => ({ label: c.nome, value: c.id, subLabel: c.cpfCnpj }))
    ];
    const currentVal = this.form.get('clienteId')?.value;

    import('../../../shared/components/nexa-select/generic-selector-bottom-sheet.component').then(m => {
      const ref = this.bottomSheet.open(m.GenericSelectorBottomSheetComponent, {
        panelClass: 'produto-bottom-sheet',
        data: { title: 'Selecionar Cliente', options, selectedValue: currentVal }
      });
      ref.afterDismissed().subscribe(result => {
        if (result !== undefined) {
          this.form.patchValue({ clienteId: result });
        }
      });
    });
  }

  abrirSeletorPagamentoMobile(): void {
    const options = this.formasPagamento.map(fp => ({ label: fp.label, value: fp.value }));
    const currentVal = this.form.get('formaPagamento')?.value;

    import('../../../shared/components/nexa-select/generic-selector-bottom-sheet.component').then(m => {
      const ref = this.bottomSheet.open(m.GenericSelectorBottomSheetComponent, {
        panelClass: 'produto-bottom-sheet',
        data: { title: 'Forma de Pagamento', options, selectedValue: currentVal }
      });
      ref.afterDismissed().subscribe(result => {
        if (result !== undefined) {
          this.form.patchValue({ formaPagamento: result });
        }
      });
    });
  }

  getClienteDisplay(): string {
    const val = this.form.get('clienteId')?.value;
    if (!val) return 'Consumidor Final (Sem Cadastro)';
    const c = this.clientes.find(x => x.id === val);
    return c ? `${c.nome} — ${c.cpfCnpj}` : '';
  }

  getPagamentoDisplay(): string {
    const val = this.form.get('formaPagamento')?.value;
    const fp = this.formasPagamento.find(x => x.value === val);
    return fp ? fp.label : '';
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
    const formaPag = this.form.get('formaPagamento')?.value;
    const cid = this.form.get('clienteId')?.value;
    
    if (formaPag === 'CREDIARIO') {
      if (!cid) {
        this.snackBar.open('Vendas no crediário exigem um cliente cadastrado e selecionado', 'Fechar', { duration: 4000 });
        return;
      }
      // Alerta não bloqueante (Lojista assumiu o risco)
      if (this.selectedClientDetails) {
        const limite = Number(this.selectedClientDetails.limiteCredito ?? 0);
        const saldo = Number(this.selectedClientDetails.saldoDevedor ?? 0);
        const disp = limite - saldo;
        const total = this.calcularTotal();
        if (total > disp) {
          this.snackBar.open(`⚠️ Limite excedido! Venda permitida sob risco do lojista.`, 'OK', { duration: 5000, panelClass: ['warning-snackbar'] });
        }
      }
    }

    if (this.form.valid && this.itens.length > 0) {
      const rawValue = this.form.value;
      const sanitizedItens = (rawValue.itens || []).map(({ produtoSearch, ...rest }: any) => rest);
      this.dialogRef.close({ ...rawValue, itens: sanitizedItens });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Se o alerta de estoque estiver aberto, ESC cancela e ENTER confirma
    if (this.showEstoqueAlerta) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelarAlerta();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.confirmarAlerta();
      }
      return;
    }

    switch (event.key) {
      case 'F2':
        event.preventDefault();
        if (this.barcodeInput) {
          this.barcodeInput.nativeElement.focus();
        }
        break;
      case 'F4':
        event.preventDefault();
        // Focus no primeiro campo de busca de produto manual, se existir
        const searchInput = document.querySelector('input[formControlName="produtoSearch"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        break;
      case 'F8':
        event.preventDefault();
        // Focus no campo de desconto global
        const discountInput = document.querySelector('input[formControlName="valorDesconto"]') as HTMLInputElement;
        if (discountInput) discountInput.focus();
        break;
      case 'F9':
        event.preventDefault();
        this.onSave();
        break;
      case 'F10':
        event.preventDefault();
        this.form.get('formaPagamento')?.setValue('CREDIARIO');
        // Usamos um truque com o seletor do MatSelect para simular um foco/abertura
        const clienteSelect = document.querySelector('mat-select[formControlName="clienteId"]') as HTMLElement;
        if (clienteSelect) {
          clienteSelect.focus();
          clienteSelect.click(); // Abre o dropdown
        }
        this.snackBar.open('Forma de pagamento definida: Crediário. Selecione o Cliente.', 'OK', { duration: 3000 });
        break;
      case 'Escape':
        event.preventDefault();
        this.dialogRef.close();
        break;
    }
  }

  // PDV / Leitor de Código de Barras reativo
  barcodeSearchTerm = '';

  onBarcodeScan(event: Event): void {
    event.preventDefault();
    let term = this.barcodeSearchTerm?.trim();
    if (!term) return;

    let multiplier = 1;

    // Verificar multiplicador de quantidade ex: "5*789123456" ou "5x789123456"
    const multiMatch = term.match(/^(\d+)[\*xX](.+)$/);
    if (multiMatch) {
      multiplier = parseInt(multiMatch[1], 10);
      term = multiMatch[2]; // o resto do código
    }

    // Lógica para balança de peso-preço: começa com '2', tem 13 dígitos
    // Exemplo comum: 2 CCCCC PPPPPP D
    // CCCCC = Código do produto (5 dígitos)
    // PPPPPP = Peso ou Preço (6 dígitos, dependendo da configuração da balança, geralmente 3 casas decimais)
    let pesoOuPrecoBalanca: number | null = null;
    if (term.startsWith('2') && term.length === 13) {
      const codigoBalanca = term.substring(1, 6); // 5 dígitos
      const valorLido = term.substring(6, 12); // 6 dígitos
      // Para simplificar, assumiremos que a balança está configurada para gerar peso (ex: kg com 3 casas decimais)
      // Exemplo: "001500" = 1.500 kg
      pesoOuPrecoBalanca = parseInt(valorLido, 10) / 1000;
      term = codigoBalanca; // O código de busca passa a ser os 5 dígitos
      multiplier = pesoOuPrecoBalanca;
    }

    // Buscar produto localmente no cache
    let prod = Array.from(this.produtosCache.values()).find(
      (p) => p.sku === term || p.codigoBarras === term || p.codigoBarras === term.padStart(13, '0') // fallback zeros
    );

    const proceedWithScan = (p: Produto) => {
      // Verificar se o produto já existe nos itens da venda
      let foundIndex = -1;
      for (let i = 0; i < this.itens.length; i++) {
        if (this.itens.at(i).get('produtoId')?.value === p.id) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex > -1) {
        // Se já está na lista, apenas incrementa a quantidade
        const itemGroup = this.getItemGroup(foundIndex);
        const currentQty = itemGroup.get('quantidade')?.value ?? 0;
        itemGroup.patchValue({ quantidade: currentQty + multiplier });
        this.snackBar.open(`Adicionada ${multiplier} unidade(s) de "${p.nome}"`, 'OK', { duration: 2000 });
      } else {
        // Se não está, adiciona um novo item
        this.addItem({
          produtoId: p.id,
          produto: p,
          quantidade: multiplier,
          valorUnitario: Number(p.precoVenda),
          valorDesconto: 0,
        });
        this.snackBar.open(`"${p.nome}" adicionado à venda! (${multiplier}x)`, 'OK', { duration: 2000 });
      }
      this.focusBarcode();
    };

    const handleProductMatch = (p: Produto) => {
      if (p.estoqueAtual <= 0) {
        this.alertaProdutoNome = p.nome;
        this.showEstoqueAlerta = true;
        this.alertaPendingAction = () => {
          proceedWithScan(p);
          this.showEstoqueAlerta = false;
        };
        this.alertaCancelAction = () => {
          this.showEstoqueAlerta = false;
        };
      } else {
        proceedWithScan(p);
      }
    };

    if (prod) {
      handleProductMatch(prod);
    } else {
      // Fetch from backend
      this.produtosService.findAll(1, 10, term).subscribe({
        next: (res) => {
          const matched = res.data?.find((p: any) => p.sku === term || p.codigoBarras === term || p.codigoBarras === term?.padStart(13, '0'));
          if (matched) {
            this.produtosCache.set(matched.id, matched);
            handleProductMatch(matched);
          } else {
            this.snackBar.open(`Produto com Código/SKU "${term}" não encontrado!`, 'Fechar', { duration: 3000 });
          }
        },
        error: () => {
          this.snackBar.open('Erro ao buscar produto para bipe rápido', 'Fechar', { duration: 3000 });
        }
      });
    }

    // Limpar o input de busca para estar pronto para o próximo bipe!
    this.barcodeSearchTerm = '';
    this.focusBarcode();
  }

  focusBarcode(): void {
    setTimeout(() => {
      if (this.barcodeInput) {
        this.barcodeInput.nativeElement.focus();
        this.barcodeInput.nativeElement.select();
      }
    }, 100);
  }

  getPixQrCodeUrl(): string {
    const total = this.calcularTotal();
    const payload = this.getPixPayload();
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=000000&data=${encodeURIComponent(payload)}`;
  }

  getPixPayload(): string {
    const total = this.calcularTotal().toFixed(2);
    return `00020101021226500014br.gov.bcb.pix0128nexa-financeiro@nexa.com.br5204000053039865405${total}5802BR5908Nexa ERP6009Sao Paulo62210517NEXASALE${Math.floor(Date.now()/1000)}`;
  }

  copyPixPayload(inputEl: HTMLInputElement): void {
    inputEl.select();
    navigator.clipboard.writeText(inputEl.value).then(() => {
      this.snackBar.open('Código PIX Copia e Cola copiado!', 'OK', { duration: 2000 });
    });
  }

  simulatePixPayment(): void {
    this.pixPago = !this.pixPago;
    if (this.pixPago) {
      this.snackBar.open('Pagamento PIX confirmado com sucesso! Salvando venda...', 'OK', { duration: 2000 });
      setTimeout(() => {
        if (this.pixPago) {
          this.onSave();
        }
      }, 1200);
    } else {
      this.snackBar.open('Confirmação de pagamento desfeita.', 'OK', { duration: 2000 });
    }
  }

  confirmarAlerta(): void {
    if (this.alertaPendingAction) {
      this.alertaPendingAction();
    }
    this.focusBarcode();
  }

  cancelarAlerta(): void {
    if (this.alertaCancelAction) {
      this.alertaCancelAction();
    }
    this.focusBarcode();
  }

  abrirSeletorProdutoMobile(index: number): void {
    if (!this.isMobile) return;

    const itemGroup = this.getItemGroup(index);
    const currentValue = itemGroup.get('produtoSearch')?.value;
    const initialTerm = typeof currentValue === 'string' ? currentValue : (currentValue?.nome || '');

    const bottomSheetRef = this.bottomSheet.open(ProdutoSelectorBottomSheetComponent, {
      data: { initialTerm },
      panelClass: 'produto-bottom-sheet'
    });

    bottomSheetRef.afterDismissed().subscribe((produto: Produto | undefined) => {
      if (produto) {
        // Set the value in the form control so it displays properly
        itemGroup.patchValue({ produtoSearch: produto });
        this.onProdutoSelected(produto, index);
      }
    });
  }
}
