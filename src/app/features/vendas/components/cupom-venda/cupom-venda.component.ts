import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Venda } from '../../services/vendas.service';

@Component({
  selector: 'app-cupom-venda',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="print-cupom" *ngIf="venda">
      <div class="cupom-header">
        <h2 class="empresa-nome">{{ venda.empresa?.nomeFantasia || venda.empresa?.razaoSocial || 'Nexa ERP' }}</h2>
        <p class="empresa-doc">CNPJ: {{ formatarCNPJ(venda.empresa?.cnpj) || '00.000.000/0000-00' }}</p>
        <p class="empresa-end">{{ venda.empresa?.endereco || 'Endereço não informado' }}, {{ venda.empresa?.cidade || 'Cidade' }} - {{ venda.empresa?.estado || 'UF' }}</p>
        <p class="cupom-data">Data: {{ venda.dataVenda | date:'dd/MM/yyyy HH:mm:ss' }}</p>
        <div class="cupom-divider"></div>
        <h3 class="cupom-titulo">CUPOM NÃO FISCAL</h3>
        <p class="venda-numero">Extrato Nº {{ venda.numero }}</p>
        <div class="cupom-divider"></div>
      </div>

      <div class="cupom-body">
        <table class="items-table">
          <thead>
            <tr>
              <th class="col-desc">DESCRIÇÃO</th>
              <th class="col-qtd">QTD</th>
              <th class="col-un">UN</th>
              <th class="col-total">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of venda.itens">
              <td class="col-desc">{{ item.produto?.nome || 'Item' }}</td>
              <td class="col-qtd">{{ item.quantidade }}</td>
              <td class="col-un">{{ (item.valorUnitario - item.valorDesconto) | number:'1.2-2' }}</td>
              <td class="col-total">{{ ((item.valorUnitario - item.valorDesconto) * item.quantidade) | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cupom-divider"></div>

      <div class="cupom-footer">
        <div class="summary-line">
          <span>Subtotal:</span>
          <span>R$ {{ calcularSubtotal() | number:'1.2-2' }}</span>
        </div>
        <div class="summary-line" *ngIf="venda.valorDesconto > 0">
          <span>Desconto:</span>
          <span>- R$ {{ venda.valorDesconto | number:'1.2-2' }}</span>
        </div>
        <div class="summary-line" *ngIf="venda.valorFrete > 0">
          <span>Frete:</span>
          <span>+ R$ {{ venda.valorFrete | number:'1.2-2' }}</span>
        </div>
        <div class="summary-line total-line">
          <strong>TOTAL A PAGAR:</strong>
          <strong>R$ {{ venda.valorTotal | number:'1.2-2' }}</strong>
        </div>
        <div class="summary-line form-pag">
          <span>FORMA DE PAGAMENTO:</span>
          <span>{{ venda.formaPagamento }}</span>
        </div>
        <div class="cupom-divider"></div>
        <div class="cliente-info" *ngIf="venda.cliente">
          <p><strong>CLIENTE:</strong> {{ venda.cliente.nome }}</p>
          <p><strong>CPF/CNPJ:</strong> {{ venda.cliente.cpfCnpj }}</p>
        </div>
        <div class="cupom-divider" *ngIf="venda.cliente"></div>
        <p class="rodape-msg">Obrigado pela preferência!</p>
        <p class="rodape-soft">Desenvolvido por Nexa ERP</p>
      </div>
    </div>
  `,
  styles: [`
    /* Este CSS aplica-se apenas no modo de tela ou se renderizado. No global styles aplicaremos media print */
    .print-cupom {
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      padding: 10px;
      box-sizing: border-box;
    }
    .cupom-header, .cupom-footer {
      text-align: center;
    }
    .empresa-nome {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 4px 0;
    }
    .empresa-doc, .empresa-end, .cupom-data, .venda-numero {
      margin: 2px 0;
      font-size: 11px;
    }
    .cupom-titulo {
      font-size: 13px;
      font-weight: bold;
      margin: 6px 0;
    }
    .cupom-divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-align: left;
    }
    .items-table th {
      border-bottom: 1px dashed #000;
      padding-bottom: 4px;
      font-weight: bold;
    }
    .items-table td {
      padding: 4px 0;
      vertical-align: top;
    }
    .col-desc { width: 50%; }
    .col-qtd { width: 15%; text-align: center; }
    .col-un { width: 15%; text-align: right; }
    .col-total { width: 20%; text-align: right; }
    
    .summary-line {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
      font-size: 12px;
    }
    .total-line {
      font-size: 14px;
      font-weight: bold;
      margin: 8px 0;
    }
    .form-pag {
      margin-top: 8px;
    }
    .cliente-info {
      text-align: left;
      font-size: 11px;
    }
    .cliente-info p {
      margin: 2px 0;
    }
    .rodape-msg {
      font-weight: bold;
      margin: 8px 0 4px 0;
    }
    .rodape-soft {
      font-size: 10px;
      margin: 0;
    }
  `]
})
export class CupomVendaComponent {
  @Input() venda: any = null;

  formatarCNPJ(v: string | undefined): string {
    if (!v) return '';
    v = v.replace(/\\D/g, '');
    if (v.length === 14) {
      return v.replace(/^(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return v;
  }

  calcularSubtotal(): number {
    if (!this.venda || !this.venda.itens) return 0;
    return this.venda.itens.reduce((sum: number, item: any) => {
      const qty = Number(item.quantidade) || 0;
      const price = Number(item.valorUnitario) || 0;
      const desc = Number(item.valorDesconto) || 0;
      return sum + (qty * (price - desc));
    }, 0);
  }
}
