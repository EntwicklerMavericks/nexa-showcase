export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  chaveAcesso: string;
  naturezaOperacao: string;
  tipoOperacao: 'ENTRADA' | 'SAIDA';
  status: 'RASCUNHO' | 'TRANSMITIDA' | 'CANCELADA' | 'CONTINGENCIA';
  dataEmissao: string;
  xmlUrl?: string;
  pdfUrl?: string;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  vendaId?: number | null;
  compraId?: number | null;
}

export const MOCK_NFES: NotaFiscal[] = [
  {
    id: 1,
    numero: '000104',
    serie: '001',
    chaveAcesso: '35260312345678000199550010000001041000001048',
    naturezaOperacao: 'Venda de mercadoria adquirida de terceiros',
    tipoOperacao: 'SAIDA',
    status: 'TRANSMITIDA',
    dataEmissao: '2026-03-01T14:05:00Z',
    xmlUrl: 'mock-xml-url-1',
    pdfUrl: 'mock-pdf-url-1',
    empresaId: 1,
    vendaId: 1,
    compraId: null,
    createdAt: '2026-03-01T14:05:00Z',
    updatedAt: '2026-03-01T14:05:00Z'
  },
  {
    id: 2,
    numero: '000105',
    serie: '001',
    chaveAcesso: '35260312345678000199550010000001051000001059',
    naturezaOperacao: 'Venda de mercadoria adquirida de terceiros',
    tipoOperacao: 'SAIDA',
    status: 'RASCUNHO',
    dataEmissao: '2026-03-03T16:50:00Z',
    xmlUrl: '',
    pdfUrl: '',
    empresaId: 1,
    vendaId: 3,
    compraId: null,
    createdAt: '2026-03-03T16:50:00Z',
    updatedAt: '2026-03-03T16:50:00Z'
  }
];
