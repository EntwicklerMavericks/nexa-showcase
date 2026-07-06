export interface ItemVenda {
  id: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  produto?: { id: number; nome: string; sku: string; precoVenda: number };
}

export interface Venda {
  id: number;
  numero: string;
  clienteId: number;
  cliente?: { id: number; nome: string; cpfCnpj: string };
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'SYNCED' | 'ERROR';
  dataVenda: string;
  formaPagamento: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO' | 'BOLETO' | 'FIADO';
  parcelas: number;
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorTotal: number;
  observacoes: string | null;
  vendedorId: number;
  notaFiscalId: number | null;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
  itens?: ItemVenda[];
}

export const MOCK_VENDAS: Venda[] = [
  {
    id: 1,
    numero: 'VND-000001',
    clienteId: 1,
    cliente: { id: 1, nome: 'Carlos Eduardo Souza', cpfCnpj: '123.456.789-00' },
    status: 'PAGO',
    dataVenda: '2026-03-01T14:00:00Z',
    formaPagamento: 'PIX',
    parcelas: 1,
    valorProdutos: 369.00,
    valorDesconto: 19.00,
    valorFrete: 0.00,
    valorTotal: 350.00,
    observacoes: 'Venda de cimento, entrega por conta do cliente.',
    vendedorId: 1,
    notaFiscalId: 1,
    empresaId: 1,
    createdAt: '2026-03-01T14:00:00Z',
    updatedAt: '2026-03-01T14:00:00Z',
    itens: [
      {
        id: 1,
        produtoId: 1,
        quantidade: 10,
        valorUnitario: 36.90,
        valorDesconto: 1.90,
        valorTotal: 350.00,
        produto: { id: 1, nome: 'Cimento Votoran CP-II 50kg', sku: 'MAT-CIM-VOT-50', precoVenda: 36.90 }
      }
    ]
  },
  {
    id: 2,
    numero: 'VND-000002',
    clienteId: 2,
    cliente: { id: 2, nome: 'Construtora Vale Verde Ltda', cpfCnpj: '12.345.678/0001-99' },
    status: 'PENDENTE',
    dataVenda: '2026-03-02T10:15:00Z',
    formaPagamento: 'BOLETO',
    parcelas: 3,
    valorProdutos: 8900.00,
    valorDesconto: 400.00,
    valorFrete: 150.00,
    valorTotal: 8650.00,
    observacoes: 'Material básico para início de fundação da obra de Alphaville. Frete contratado da empresa.',
    vendedorId: 1,
    notaFiscalId: null,
    empresaId: 1,
    createdAt: '2026-03-02T10:15:00Z',
    updatedAt: '2026-03-02T10:15:00Z',
    itens: [
      {
        id: 2,
        produtoId: 2,
        quantidade: 10,
        valorUnitario: 890.00,
        valorDesconto: 40.00,
        valorTotal: 8500.00,
        produto: { id: 2, nome: 'Tijolo Baianinho 8 Furos 9x19x19cm (Milheiro)', sku: 'MAT-TIJ-8F-1000', precoVenda: 890.00 }
      }
    ]
  },
  {
    id: 3,
    numero: 'VND-000003',
    clienteId: 3,
    cliente: { id: 3, nome: 'Ana Julia Pereira', cpfCnpj: '987.654.321-11' },
    status: 'PAGO',
    dataVenda: '2026-03-03T16:45:00Z',
    formaPagamento: 'FIADO',
    parcelas: 1,
    valorProdutos: 558.90,
    valorDesconto: 8.90,
    valorFrete: 0.00,
    valorTotal: 550.00,
    observacoes: 'Compra de acabamentos hidráulicos e chuveiro. Autorizado pelo gerente.',
    vendedorId: 1,
    notaFiscalId: 2,
    empresaId: 1,
    createdAt: '2026-03-03T16:45:00Z',
    updatedAt: '2026-03-03T16:45:00Z',
    itens: [
      {
        id: 3,
        produtoId: 11,
        quantidade: 2,
        valorUnitario: 99.90,
        valorDesconto: 0.00,
        valorTotal: 199.80,
        produto: { id: 11, nome: 'Torneira para Cozinha Bica Móvel Lorenzetti Docol', sku: 'LOU-TOR-LOR-GOURMET', precoVenda: 99.90 }
      },
      {
        id: 4,
        produtoId: 12,
        quantidade: 1,
        valorUnitario: 349.90,
        valorDesconto: 8.90,
        valorTotal: 341.00,
        produto: { id: 12, nome: 'Chuveiro Elétrico Lorenzetti Acqua Ultra 7800W 220V', sku: 'LOU-CHU-LOR-ACQUA', precoVenda: 349.90 }
      }
    ]
  },
  {
    id: 4,
    numero: 'VND-000004',
    clienteId: 1,
    cliente: { id: 1, nome: 'Carlos Eduardo Souza', cpfCnpj: '123.456.789-00' },
    status: 'PAGO',
    dataVenda: '2026-03-04T09:00:00Z',
    formaPagamento: 'CREDITO',
    parcelas: 2,
    valorProdutos: 419.00,
    valorDesconto: 0.00,
    valorFrete: 0.00,
    valorTotal: 419.00,
    observacoes: 'Ferramenta de uso pessoal.',
    vendedorId: 2,
    notaFiscalId: 3,
    empresaId: 1,
    createdAt: '2026-03-04T09:00:00Z',
    updatedAt: '2026-03-04T09:00:00Z',
    itens: [
      {
        id: 5,
        produtoId: 4,
        quantidade: 1,
        valorUnitario: 419.00,
        valorDesconto: 0.00,
        valorTotal: 419.00,
        produto: { id: 4, nome: 'Furadeira e Parafusadeira Bosch 12V', sku: 'FER-FUR-BOS-12V', precoVenda: 419.00 }
      }
    ]
  },
  {
    id: 5,
    numero: 'VND-000005',
    clienteId: 4,
    cliente: { id: 4, nome: 'Mário Sergio Nogueira', cpfCnpj: '456.789.012-34' },
    status: 'PAGO',
    dataVenda: '2026-03-05T11:20:00Z',
    formaPagamento: 'PIX',
    parcelas: 1,
    valorProdutos: 1128.80,
    valorDesconto: 78.80,
    valorFrete: 50.00,
    valorTotal: 1100.00,
    observacoes: 'Pisos e argamassa para reforma de cozinha comercial.',
    vendedorId: 1,
    notaFiscalId: 4,
    empresaId: 1,
    createdAt: '2026-03-05T11:20:00Z',
    updatedAt: '2026-03-05T11:20:00Z',
    itens: [
      {
        id: 6,
        produtoId: 8,
        quantidade: 10,
        valorUnitario: 79.90,
        valorDesconto: 29.00,
        valorTotal: 770.00,
        produto: { id: 8, nome: 'Porcelanato Portobello 60x60cm Munari Cimento (Caixa 1.44m²)', sku: 'PIS-POR-PTB-60', precoVenda: 79.90 }
      },
      {
        id: 7,
        produtoId: 9,
        quantidade: 11,
        valorUnitario: 29.90,
        valorDesconto: 49.80,
        valorTotal: 279.10,
        produto: { id: 9, nome: 'Argamassa Quartzolit AC-III 20kg', sku: 'PIS-ARG-QZ3-20', precoVenda: 29.90 }
      }
    ]
  }
];
