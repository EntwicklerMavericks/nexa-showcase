import { Component, Inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Produto } from '../services/produtos.service';

export interface EtiquetaDialogData {
  produto: Produto;
}

@Component({
  selector: 'app-etiqueta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './etiqueta-dialog.component.html',
})
export class EtiquetaDialogComponent {
  readonly quantidade = signal(6); // Padrão 6 etiquetas para exibição inicial

  // Gera uma lista com base na quantidade para iteração nos templates de preview e impressão
  readonly etiquetasArray = computed(() => {
    const q = this.quantidade();
    return Array.from({ length: q > 0 ? q : 1 });
  });

  constructor(
    private readonly dialogRef: MatDialogRef<EtiquetaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EtiquetaDialogData
  ) {}

  increment(): void {
    this.quantidade.update((q) => q + 1);
  }

  decrement(): void {
    this.quantidade.update((q) => (q > 1 ? q - 1 : 1));
  }

  imprimir(): void {
    const produto = this.data.produto;
    const qtd = this.quantidade();
    const preco = parseFloat(produto.precoVenda.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 1. Criar janela popup dedicada para impressão isolada
    const printWindow = window.open('', '_blank', 'width=850,height=600');
    if (!printWindow) {
      alert('Por favor, libere a abertura de popups nas configurações do navegador para poder imprimir as etiquetas!');
      return;
    }

    // 2. Gerar o HTML repetindo o card de etiqueta na quantidade solicitada
    let labelsHTML = '';
    for (let i = 0; i < qtd; i++) {
      labelsHTML += `
        <div class="etiqueta-card">
          <div class="etiqueta-header">
            <span class="brand-sub">NEXA ERP</span>
            <span class="sku-sub">SKU: ${produto.sku}</span>
          </div>
          <div class="etiqueta-title">${produto.nome}</div>
          <div class="etiqueta-barcode">*${produto.codigoBarras}*</div>
          <div class="etiqueta-footer">
            <span class="barcode-text">${produto.codigoBarras}</span>
            <span class="price-tag">R$ ${preco}</span>
          </div>
        </div>
      `;
    }

    // 3. Injetar documento HTML estruturado com reset absoluto de folha e a fonte do Google Fonts
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Etiquetas — ${produto.nome}</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Libre+Barcode+39&display=swap" rel="stylesheet" />
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .etiquetas-print-sheet {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
          }
          .etiqueta-card {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            border-radius: 4px;
            padding: 8px 6px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            min-height: 110px;
            height: auto;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 4px;
            overflow: hidden;
          }
          .etiqueta-header {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-weight: 700;
            color: #777777;
            border-bottom: 0.5px solid #eeeeee;
            padding-bottom: 3px;
            margin-bottom: 4px;
          }
          .brand-sub {
            color: #e65100;
          }
          .sku-sub {
            color: #777777;
          }
          .etiqueta-title {
            font-size: 11px;
            font-weight: 700;
            color: #000000;
            line-height: 1.2;
            height: 26px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .etiqueta-barcode {
            font-family: 'Libre Barcode 39', cursive !important;
            font-size: 26px;
            line-height: 1.1;
            text-align: center;
            margin: 4px 0;
            color: #000000;
            height: 32px;
            overflow: hidden;
            white-space: nowrap;
            letter-spacing: -0.5px;
          }
          .etiqueta-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            font-size: 9px;
            font-weight: 600;
            border-top: 0.5px solid #eeeeee;
            padding-top: 3px;
          }
          .barcode-text {
            color: #555555;
            font-size: 8px;
          }
          .price-tag {
            font-weight: 800;
            color: #000000;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="etiquetas-print-sheet">
          ${labelsHTML}
        </div>
        <script>
          // Espera carregar a fonte de código de barras para escaneamento perfeito e imprime
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
