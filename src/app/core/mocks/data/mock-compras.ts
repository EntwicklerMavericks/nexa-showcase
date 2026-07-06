export interface Compra {
  id: number;
  numero: string;
  fornecedorId: number;
  fornecedor?: { id: number; nome: string };
  status: 'PENDENTE' | 'PAGO' | 'RECEBIDO' | 'CANCELADO';
  dataCompra: string;
  formaPagamento: string;
  parcelas: number;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  observacoes: string | null;
  compradorId: number;
  notaFiscalId: number | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: any[];
}

export const MOCK_COMPRAS: Compra[] = [
  {
    id: 1,
    numero: 'OC-000001',
    fornecedorId: 1,
    fornecedor: { id: 1, nome: 'Votorantim Cimentos S/A' },
    status: 'RECEBIDO',
    dataCompra: '2026-02-15T09:00:00Z',
    formaPagamento: 'BOLETO',
    parcelas: 1,
    valorProdutos: 2850.00,
    valorDesconto: 150.00,
    valorFrete: 200.00,
    valorTotal: 2900.00,
    observacoes: 'Compra de 100 sacos de cimento Votoran 50kg.',
    compradorId: 1,
    notaFiscalId: 10,
    empresaId: 1,
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
    itens: [
      {
        id: 1,
        produtoId: 1,
        quantidade: 100,
        valorUnitario: 28.50,
        valorTotal: 2850.00
      }
    ]
  },
  {
    id: 2,
    numero: 'OC-000002',
    fornecedorId: 3,
    fornecedor: { id: 3, nome: 'Robert Bosch Ltda' },
    status: 'PENDENTE',
    dataCompra: '2026-02-28T14:00:00Z',
    formaPagamento: 'FATURADO_30D',
    parcelas: 1,
    valorProdutos: 1450.00,
    valorDesconto: 0.00,
    valorFrete: 50.00,
    valorTotal: 1500.00,
    observacoes: 'Reposição de estoque de furadeiras Bosch.',
    compradorId: 1,
    notaFiscalId: null,
    empresaId: 1,
    createdAt: '2026-02-28T14:00:00Z',
    updatedAt: '2026-02-28T14:00:00Z',
    itens: [
      {
        id: 2,
        produtoId: 4,
        quantidade: 5,
        valorUnitario: 290.00,
        valorTotal: 1450.00
      }
    ]
  }
];
