import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  printVendaCupom(venda: any, empresa: any, printWindow?: Window | null): void {
    if (!printWindow) {
      printWindow = window.open('', '_blank', 'width=400,height=600');
    }
    if (!printWindow) {
      alert('Pop-up bloqueado! Permita popups para imprimir.');
      return;
    }

    const companyName = empresa?.nomeFantasia || empresa?.razaoSocial || 'Nexa ERP';
    const companyCnpj = empresa?.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
    const companyPhone = empresa?.telefone ? `Tel: ${empresa.telefone}` : '';
    const companyAddress = empresa?.endereco ? `${empresa.endereco}, ${empresa.cidade || ''} - ${empresa.estado || ''}` : '';

    const clientName = venda.cliente?.nome || 'Consumidor Final';
    const clientCpfCnpj = venda.cliente?.cpfCnpj ? `CPF/CNPJ: ${venda.cliente.cpfCnpj}` : 'Sem identificação';

    const dateStr = new Date(venda.dataVenda || venda.createdAt).toLocaleString('pt-BR');

    let itemsHtml = '';
    venda.itens?.forEach((item: any) => {
      const prodName = item.produto?.nome || 'Produto';
      const prodSku = item.produto?.sku || '';
      const qty = Number(item.quantidade);
      const price = Number(item.valorUnitario);
      const total = Number(item.valorTotal);
      const unit = item.produto?.unidade || 'UN';

      itemsHtml += `
        <tr>
          <td colspan="4" style="padding-top: 4px; font-weight: bold;">${prodName} (${prodSku})</td>
        </tr>
        <tr>
          <td style="text-align: left; padding-bottom: 4px;">${qty.toFixed(3)} ${unit}</td>
          <td style="text-align: right; padding-bottom: 4px;">x R$ ${price.toFixed(2)}</td>
          <td style="text-align: right; padding-bottom: 4px;">- R$ ${Number(item.valorDesconto).toFixed(2)}</td>
          <td style="text-align: right; padding-bottom: 4px; font-weight: bold;">R$ ${total.toFixed(2)}</td>
        </tr>
      `;
    });

    const subtotal = Number(venda.valorProdutos || 0);
    const desconto = Number(venda.valorDesconto || 0);
    const frete = Number(venda.valorFrete || 0);
    const totalVenda = Number(venda.valorTotal || 0);

    const pagamentoMap: Record<string, string> = {
      DINHEIRO: 'Dinheiro', PIX: 'PIX', CARTAO_CREDITO: 'Cartão Crédito',
      CARTAO_DEBITO: 'Cartão Débito', BOLETO: 'Boleto', TRANSFERENCIA: 'Transferência'
    };
    const formaPagto = pagamentoMap[venda.formaPagamento] || venda.formaPagamento;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cupom Venda #${venda.numero || venda.id}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            width: 72mm;
            margin: 0 auto;
            padding: 10px 0;
            color: #000;
            background-color: #fff;
            line-height: 1.2;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .header {
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }
          .company-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 4px 0;
          }
          .details {
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .items-table {
            border-bottom: 1px dashed #000;
            margin-bottom: 8px;
            padding-bottom: 8px;
          }
          .totals-table td {
            padding: 2px 0;
          }
          .totals-container {
            border-bottom: 1px dashed #000;
            margin-bottom: 8px;
            padding-bottom: 8px;
          }
          .footer {
            margin-top: 15px;
            font-size: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header text-center">
          <h1 class="company-title">${companyName}</h1>
          ${companyAddress ? `<div>${companyAddress}</div>` : ''}
          ${companyPhone ? `<div>${companyPhone}</div>` : ''}
          ${companyCnpj ? `<div>${companyCnpj}</div>` : ''}
        </div>

        <div class="details">
          <div><strong>Nº VENDA:</strong> ${venda.numero || venda.id}</div>
          <div><strong>DATA:</strong> ${dateStr}</div>
          <div><strong>CLIENTE:</strong> ${clientName}</div>
          <div><strong>DOC:</strong> ${clientCpfCnpj}</div>
          ${venda.status === 'CANCELADA' ? '<div style="color:red; font-weight:bold; font-size:14px; text-align:center; margin-top:4px;">CUPOM CANCELADO</div>' : ''}
        </div>

        <table class="items-table">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding-bottom: 4px;">Qtd/Unidade</th>
              <th style="text-align: right; padding-bottom: 4px;">Preço Unit.</th>
              <th style="text-align: right; padding-bottom: 4px;">Desc.</th>
              <th style="text-align: right; padding-bottom: 4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-container">
          <table class="totals-table">
            <tr>
              <td>Subtotal dos Itens:</td>
              <td class="text-right">R$ ${subtotal.toFixed(2)}</td>
            </tr>
            ${desconto > 0 ? `
            <tr>
              <td>Desconto Global:</td>
              <td class="text-right">- R$ ${desconto.toFixed(2)}</td>
            </tr>` : ''}
            ${frete > 0 ? `
            <tr>
              <td>Valor Frete:</td>
              <td class="text-right">+ R$ ${frete.toFixed(2)}</td>
            </tr>` : ''}
            <tr class="bold" style="font-size: 14px;">
              <td>VALOR TOTAL:</td>
              <td class="text-right">R$ ${totalVenda.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="details" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
          <div><strong>FORMA PAGTO:</strong> ${formaPagto}</div>
          <div><strong>PARCELAS:</strong> ${venda.parcelas}x</div>
          ${venda.observacoes ? `<div style="margin-top: 4px; font-style: italic;">Obs: ${venda.observacoes}</div>` : ''}
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div style="margin-top: 5px; font-weight: bold;">Nexa ERP — Soluções Comerciais</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  printOrcamento(orcamento: any, empresa: any): void {
    const dataFormat = new Date(orcamento.dataOrcamento).toLocaleDateString('pt-BR');
    const validadeFormat = new Date(orcamento.validade).toLocaleDateString('pt-BR');

    const companyName = empresa?.razaoSocial || 'Nexa ERP';
    const companyLogo = empresa?.logo || '';
    const companyCNPJ = empresa?.cnpj ? empresa.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : '';
    const companyPhone = empresa?.telefone || '';
    const companyEmail = empresa?.email || '';
    const companyAddress = empresa?.endereco || '';
    const companyCityState = empresa?.cidade && empresa?.estado ? `${empresa.cidade} - ${empresa.estado}` : '';

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      alert('Pop-up bloqueado! Permita popups para visualizar a impressão.');
      return;
    }

    const clientName = orcamento.cliente?.nome || 'Cliente não identificado';
    const clientCNPJ = orcamento.cliente?.cpfCnpj ? orcamento.cliente.cpfCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : '';
    const clientPhone = orcamento.cliente?.telefone || '';
    const clientEmail = orcamento.cliente?.email || '';
    const clientAddress = orcamento.cliente?.endereco || '';

    let itemsHtml = '';
    orcamento.itens?.forEach((item: any, idx: number) => {
      const prodName = item.produto?.nome || 'Produto';
      const prodSku = item.produto?.sku || '';
      const qty = Number(item.quantidade);
      const price = Number(item.valorUnitario);
      const discount = Number(item.valorDesconto);
      const total = Number(item.valorTotal);
      const unit = item.unidade || 'UN';

      itemsHtml += `
        <tr>
          <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9;">${(idx + 1).toString().padStart(2, '0')}</td>
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600;">${prodName}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">SKU: ${prodSku}</div>
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; text-align: center;">${qty} ${unit}</td>
          <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; text-align: right;">R$ ${price.toFixed(2)}</td>
          <td style="padding: 10px 14px; font-size: 13px; color: #ef4444; border-bottom: 1px solid #f1f5f9; text-align: right;">${discount > 0 ? `- R$ ${discount.toFixed(2)}` : 'R$ 0,00'}</td>
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-weight: 700; text-align: right;">R$ ${total.toFixed(2)}</td>
        </tr>
      `;
    });

    const subtotal = Number(orcamento.valorProdutos || 0);
    const desconto = Number(orcamento.valorDesconto || 0);
    const frete = Number(orcamento.valorFrete || 0);
    const totalVenda = Number(orcamento.valorTotal || 0);

    const pagamentoMap: Record<string, string> = {
      DINHEIRO: 'Dinheiro', PIX: 'PIX', CARTAO_CREDITO: 'Cartão Crédito',
      CARTAO_DEBITO: 'Cartão Débito', BOLETO: 'Boleto', TRANSFERENCIA: 'Transferência'
    };
    const formaPagto = pagamentoMap[orcamento.formaPagamento] || orcamento.formaPagamento || 'Não informada';

    const htmlContent = `
      <html>
        <head>
          <title>Orçamento #${orcamento.numero || orcamento.id}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 15mm 20mm 15mm;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              padding: 0;
              margin: 0;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print-bar {
              background-color: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
              padding: 12px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .print-btn {
              background-color: #f89418;
              color: white;
              border: none;
              padding: 10px 22px;
              font-size: 14px;
              font-weight: 700;
              border-radius: 8px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 4px 12px rgba(248, 148, 24, 0.2);
              transition: all 0.2s ease;
            }
            .print-btn:hover {
              background-color: #e07f0b;
              box-shadow: 0 4px 16px rgba(248, 148, 24, 0.35);
            }
            .print-container {
              padding: 10px;
            }
            .header-layout {
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 24px;
              align-items: center;
              border-bottom: 3px solid #f89418;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .logo-area {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo-img {
              max-height: 54px;
              max-width: 160px;
              object-fit: contain;
            }
            .logo-text {
              font-size: 26px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .logo-accent {
              color: #f89418;
            }
            .company-info {
              font-size: 12px;
              color: #475569;
              line-height: 1.5;
            }
            .document-title {
              text-align: right;
            }
            .document-title h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .document-title .doc-num {
              color: #f89418;
              font-size: 16px;
              font-weight: 700;
              margin-top: 4px;
            }
            .document-title .doc-dates {
              font-size: 12px;
              color: #64748b;
              margin-top: 6px;
              line-height: 1.4;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 24px;
            }
            .details-card {
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 16px;
              background-color: #fafafa;
            }
            .details-card h3 {
              margin: 0 0 10px 0;
              font-size: 13px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              letter-spacing: 0.8px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            .details-card p {
              margin: 6px 0;
              font-size: 13px;
              color: #1e293b;
            }
            .details-card strong {
              color: #475569;
            }
            .item-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .item-table th {
              background-color: #f1f5f9;
              padding: 10px 14px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
            }
            .item-table td {
              border-bottom: 1px solid #f1f5f9;
            }
            .summary-layout {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 40px;
              align-items: start;
              margin-top: 24px;
            }
            .notes-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px;
              background-color: #fafafa;
              font-size: 12px;
              color: #475569;
              line-height: 1.5;
            }
            .notes-card h4 {
              margin: 0 0 8px 0;
              color: #334155;
              font-size: 13px;
              font-weight: 700;
            }
            .notes-card p {
              margin: 0;
              white-space: pre-wrap;
            }
            .totals-container {
              display: flex;
              flex-direction: column;
              gap: 8px;
              align-items: flex-end;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              width: 100%;
              max-width: 320px;
              font-size: 13px;
              color: #475569;
            }
            .totals-row.discount {
              color: #ef4444;
              font-weight: 600;
            }
            .totals-row.grand-total {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              border-top: 2px solid #e2e8f0;
              padding-top: 10px;
              margin-top: 4px;
            }
            .signatures-block {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 60px;
              margin-top: 60px;
              page-break-inside: avoid;
            }
            .signature-line {
              text-align: center;
              font-size: 12px;
              color: #475569;
            }
            .signature-line .line {
              border-top: 1.5px dashed #cbd5e1;
              margin-bottom: 8px;
              width: 80%;
              margin-left: auto;
              margin-right: auto;
            }
            .print-footer {
              border-top: 1.5px solid #e2e8f0;
              padding-top: 16px;
              margin-top: 60px;
              text-align: center;
              font-size: 11px;
              color: #64748b;
              line-height: 1.6;
              page-break-inside: avoid;
            }
            @media print {
              .no-print-bar {
                display: none !important;
              }
              body {
                padding: 0;
                background-color: transparent;
              }
              .print-container {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <span style="font-size: 13px; color: #64748b; font-weight: 500;">Modo de Visualização de Impressão A4</span>
            <button class="print-btn" onclick="window.print();window.close();">
              <span>🖨️</span> Imprimir / Gerar PDF
            </button>
          </div>
          
          <div class="print-container">
            <!-- Header layout -->
            <div class="header-layout">
              <div class="logo-area">
                ${companyLogo ? `<img src="${companyLogo}" class="logo-img" alt="Logo da Empresa" />` : `
                  <div class="logo-text">⚡<span class="logo-accent">NEXA</span></div>
                `}
                <div class="company-info">
                  <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 2px;">${companyName}</div>
                  ${companyCNPJ ? `<div><strong>CNPJ:</strong> ${companyCNPJ}</div>` : ''}
                  ${companyAddress ? `<div><strong>Endereço:</strong> ${companyAddress} ${companyCityState ? `- ${companyCityState}` : ''}</div>` : ''}
                  ${companyPhone ? `<div><strong>Telefone:</strong> ${companyPhone}</div>` : ''}
                  ${companyEmail ? `<div><strong>E-mail:</strong> ${companyEmail}</div>` : ''}
                </div>
              </div>
              <div class="document-title">
                <h1>ORÇAMENTO COMERCIAL</h1>
                <div class="doc-num">Nº #${orcamento.numero || orcamento.id}</div>
                <div class="doc-dates">
                  <div><strong>Emitido em:</strong> ${dataFormat}</div>
                  <div style="color: #f89418; font-weight: 600;"><strong>Validade até:</strong> ${validadeFormat}</div>
                </div>
              </div>
            </div>

            <!-- Details cards -->
            <div class="details-grid">
              <div class="details-card">
                <h3>Identificação do Cliente</h3>
                <p><strong>Nome/Razão Social:</strong> ${clientName}</p>
                ${clientCNPJ ? `<p><strong>CPF/CNPJ:</strong> ${clientCNPJ}</p>` : ''}
                ${clientPhone ? `<p><strong>Telefone:</strong> ${clientPhone}</p>` : ''}
                ${clientEmail ? `<p><strong>E-mail:</strong> ${clientEmail}</p>` : ''}
                ${clientAddress ? `<p><strong>Endereço:</strong> ${clientAddress}</p>` : ''}
              </div>
              
              <div class="details-card">
                <h3>Condições Comerciais</h3>
                <p><strong>Forma de Pagamento:</strong> ${formaPagto}</p>
                <p><strong>Quantidade de Parcelas:</strong> ${orcamento.parcelas}x</p>
                <p><strong>Status:</strong> ${orcamento.status}</p>
                <p><strong>Vendedor Responsável:</strong> Código #${orcamento.vendedorId}</p>
              </div>
            </div>

            <!-- Items table -->
            <table class="item-table">
              <thead>
                <tr>
                  <th style="width: 5%;">Item</th>
                  <th style="width: 45%;">Produto / Serviço</th>
                  <th style="width: 10%; text-align: center;">Qtd</th>
                  <th style="width: 13%; text-align: right;">Vlr. Unit.</th>
                  <th style="width: 12%; text-align: right;">Desc.</th>
                  <th style="width: 15%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Summary & Totals layout -->
            <div class="summary-layout">
              <div class="notes-card">
                <h4>Observações Adicionais</h4>
                <p>${orcamento.observacoes || 'Nenhuma observação comercial foi adicionada a este documento.'}</p>
              </div>
              
              <div class="totals-container">
                <div class="totals-row">
                  <span>Subtotal de Itens:</span>
                  <span>R$ ${subtotal.toFixed(2)}</span>
                </div>
                ${desconto > 0 ? `
                  <div class="totals-row discount">
                    <span>Desconto Aplicado:</span>
                    <span>- R$ ${desconto.toFixed(2)}</span>
                  </div>
                ` : ''}
                ${frete > 0 ? `
                  <div class="totals-row">
                    <span>Valor do Frete:</span>
                    <span>+ R$ ${frete.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="totals-row grand-total">
                  <span>Valor Total:</span>
                  <span>R$ ${totalVenda.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Signatures block -->
            <div class="signatures-block">
              <div class="signature-line">
                <div class="line"></div>
                <strong>Representante Comercial</strong>
                <div style="font-size: 11px; margin-top: 2px;">Código #${orcamento.vendedorId}</div>
              </div>
              <div class="signature-line">
                <div class="line"></div>
                <strong>De Acordo (Assinatura do Cliente)</strong>
                <div style="font-size: 11px; margin-top: 2px;">${clientName}</div>
              </div>
            </div>

            <!-- Print footer -->
            <div class="print-footer">
              <div>Este documento é uma proposta comercial sujeita a alteração sem aviso prévio ou expiração do prazo de validade.</div>
              <div style="font-weight: bold; margin-top: 4px;">Nexa ERP — Sistema de Gestão Inteligente</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  printCarneCrediario(cliente: any, parcelas: any[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Bloqueador de pop-ups ativo. Permita abertura para imprimir.');
      return;
    }

    let slipsHtml = '';
    parcelas.forEach((p, idx) => {
      const date = new Date(p.dataVencimento).toLocaleDateString('pt-BR');
      const val = Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      slipsHtml += `
        <div class="carne-slip">
          <div class="slip-header">
            <span class="logo-text">Nexa ERP</span>
            <span class="slip-title">CARNÊ DE PAGAMENTO — VIA CLIENTE</span>
          </div>
          <div class="slip-body">
            <div class="info-group">
              <span class="label">Cliente:</span>
              <span class="val">${cliente.nome}</span>
            </div>
            <div class="info-group">
              <span class="label">CPF/CNPJ:</span>
              <span class="val">${cliente.cpfCnpj}</span>
            </div>
            <div class="info-group">
              <span class="label">Descrição:</span>
              <span class="val">${p.descricao}</span>
            </div>
            <div class="stats-row">
              <div class="stat-box">
                <span class="label">Vencimento:</span>
                <span class="val highlight">${date}</span>
              </div>
              <div class="stat-box">
                <span class="label">Valor da Parcela:</span>
                <span class="val highlight">R$ ${val}</span>
              </div>
            </div>
          </div>
          <div class="slip-footer">
            <span>Parcela ${idx + 1} de ${parcelas.length}</span>
            <span>Autenticação Mecânica / Assinatura do Recebedor</span>
          </div>
        </div>

        <div class="carne-slip banco" style="margin-top: 10px; border-bottom: 2px dashed #000; padding-bottom: 15px;">
          <div class="slip-header">
            <span class="logo-text">Nexa ERP</span>
            <span class="slip-title">CARNÊ DE PAGAMENTO — VIA CAIXA</span>
          </div>
          <div class="slip-body">
            <div class="info-group">
              <span class="label">Cliente:</span>
              <span class="val">${cliente.nome}</span>
            </div>
            <div class="info-group">
              <span class="label">CPF/CNPJ:</span>
              <span class="val">${cliente.cpfCnpj}</span>
            </div>
            <div class="info-group">
              <span class="label">Vencimento:</span>
              <span class="val">${date}</span>
            </div>
            <div class="info-group">
              <span class="label">Valor da Parcela:</span>
              <span class="val">R$ ${val}</span>
            </div>
            <div class="info-group">
              <span class="label">Desc/Multa:</span>
              <span class="val">_______________________</span>
            </div>
            <div class="info-group">
              <span class="label">Total Recebido:</span>
              <span class="val">_______________________</span>
            </div>
          </div>
          <div class="slip-footer">
            <span>Parcela ${idx + 1} de ${parcelas.length}</span>
            <span>Visto do Caixa: _______________________</span>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Carnê de Pagamento</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #334155;
              padding: 20px;
              max-width: 680px;
              margin: 0 auto;
            }
            .carne-slip {
              border: 1.5px solid #cbd5e1;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 12px;
              background-color: #f8fafc;
              box-sizing: border-box;
            }
            .carne-slip.banco {
              background-color: #ffffff;
            }
            .slip-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .logo-text {
              font-weight: 800;
              color: #f89418;
              font-size: 16px;
            }
            .slip-title {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              letter-spacing: 0.5px;
            }
            .slip-body {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .info-group {
              display: flex;
              font-size: 13px;
            }
            .info-group .label {
              width: 100px;
              font-weight: 600;
              color: #64748b;
            }
            .info-group .val {
              color: #0f172a;
              font-weight: 500;
            }
            .stats-row {
              display: flex;
              gap: 16px;
              margin-top: 6px;
              border-top: 1px solid #f1f5f9;
              padding-top: 10px;
            }
            .stat-box {
              flex: 1;
              background: #fff;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
            }
            .stat-box .label {
              display: block;
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .stat-box .val.highlight {
              font-size: 15px;
              font-weight: 700;
              color: #f89418;
            }
            .slip-footer {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
              margin-top: 12px;
              border-top: 1px dashed #e2e8f0;
              padding-top: 8px;
            }
            @media print {
              body {
                padding: 0;
              }
              .carne-slip {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 1000)">
          ${slipsHtml}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
