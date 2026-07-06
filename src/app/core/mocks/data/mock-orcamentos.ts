export interface Orcamento {
  id: number;
  numero: string;
  clienteId: number;
  cliente?: { id: number; nome: string; cpfCnpj: string };
  status: 'PENDENTE' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'EXPIRADO';
  dataOrcamento: string;
  validade: string;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  observacoes: string | null;
  vendedorId: number;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: any[];
}

export const MOCK_ORCAMENTOS: Orcamento[] = [
  {
    id: 1,
    numero: 'ORC-000001',
    clienteId: 1,
    cliente: { id: 1, nome: 'Carlos Eduardo Souza', cpfCnpj: '123.456.789-00' },
    status: 'ENVIADO',
    dataOrcamento: '2026-03-01T10:00:00Z',
    validade: '2026-03-15T18:00:00Z',
    valorProdutos: 508.00,
    valorDesconto: 28.00,
    valorFrete: 0.00,
    valorTotal: 480.00,
    observacoes: 'Orçamento de fiação e tomadas para reforma do quarto do filho.',
    vendedorId: 1,
    empresaId: 1,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    itens: [
      {
        id: 1,
        produtoId: 6,
        quantidade: 3,
        valorUnitario: 169.00,
        valorDesconto: 9.33,
        valorTotal: 480.00,
        produto: { id: 6, nome: 'Cabo Flexível Sil 2.5mm² Azul 100m', sku: 'ELE-CAB-SIL-2.5', precoVenda: 169.00 }
      }
    ]
  },
  {
    id: 2,
    numero: 'ORC-000002',
    clienteId: 2,
    cliente: { id: 2, nome: 'Construtora Vale Verde Ltda', cpfCnpj: '12.345.678/0001-99' },
    status: 'APROVADO',
    dataOrcamento: '2026-03-02T11:00:00Z',
    validade: '2026-03-10T18:00:00Z',
    valorProdutos: 4394.50,
    valorDesconto: 194.50,
    valorFrete: 100.00,
    valorTotal: 4300.00,
    observacoes: 'Cotei o porcelanato portobello Munari com desconto corporativo.',
    vendedorId: 1,
    empresaId: 1,
    createdAt: '2026-03-02T11:00:00Z',
    updatedAt: '2026-03-02T11:20:00Z',
    itens: [
      {
        id: 2,
        produtoId: 8,
        quantidade: 55,
        valorUnitario: 79.90,
        valorDesconto: 3.53,
        valorTotal: 4200.00,
        produto: { id: 8, nome: 'Porcelanato Portobello 60x60cm Munari Cimento (Caixa 1.44m²)', sku: 'PIS-POR-PTB-60', precoVenda: 79.90 }
      }
    ]
  }
];
