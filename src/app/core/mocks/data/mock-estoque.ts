export const MOCK_ESTOQUE_HISTORICO: Record<number, any[]> = {
  1: [
    {
      id: 1,
      produtoId: 1,
      tipo: 'ENTRADA',
      quantidade: 100,
      valorUnitario: 28.50,
      justificativa: 'Compra de estoque - OC-000001',
      usuario: { nome: 'Admin Demo' },
      createdAt: '2026-02-15T09:00:00Z'
    },
    {
      id: 2,
      produtoId: 1,
      tipo: 'SAIDA',
      quantidade: 10,
      valorUnitario: 35.00,
      justificativa: 'Venda VND-000001',
      usuario: { nome: 'Vendedor Demo' },
      createdAt: '2026-03-01T14:00:00Z'
    }
  ],
  4: [
    {
      id: 3,
      produtoId: 4,
      tipo: 'ENTRADA',
      quantidade: 10,
      valorUnitario: 290.00,
      justificativa: 'Saldo Inicial',
      usuario: { nome: 'Admin Demo' },
      createdAt: '2026-01-10T12:00:00Z'
    },
    {
      id: 4,
      produtoId: 4,
      tipo: 'SAIDA',
      quantidade: 1,
      valorUnitario: 419.00,
      justificativa: 'Venda VND-000004',
      usuario: { nome: 'Vendedor Demo' },
      createdAt: '2026-03-04T09:00:00Z'
    }
  ]
};

export const MOCK_ESTOQUE_ALERTAS = [
  {
    id: 5,
    nome: 'Tinta Acrílica Suvinil Fosco Toque de Seda Branco 18L',
    sku: 'TIN-ACR-SUV-18L',
    estoqueMinimo: 10,
    estoqueAtual: 4,
    unidade: 'LT'
  },
  {
    id: 12,
    nome: 'Chuveiro Elétrico Lorenzetti Acqua Ultra 7800W 220V',
    sku: 'LOU-CHU-LOR-ACQUA',
    estoqueMinimo: 6,
    estoqueAtual: 2,
    unidade: 'UN'
  }
];

export const MOCK_ESTOQUE_REPOSICAO = [
  {
    id: 5,
    nome: 'Tinta Acrílica Suvinil Fosco Toque de Seda Branco 18L',
    sku: 'TIN-ACR-SUV-18L',
    categoriaNome: 'Tintas e Acessórios',
    estoqueAtual: 4,
    estoqueMinimo: 10,
    sugestaoCompra: 16,
    precoCusto: 280.00,
    custoTotalEstimado: 4480.00,
    fornecedorNome: 'Robert Bosch Ltda'
  },
  {
    id: 12,
    nome: 'Chuveiro Elétrico Lorenzetti Acqua Ultra 7800W 220V',
    sku: 'LOU-CHU-LOR-ACQUA',
    categoriaNome: 'Louças e Metais',
    estoqueAtual: 2,
    estoqueMinimo: 6,
    sugestaoCompra: 10,
    precoCusto: 230.00,
    custoTotalEstimado: 2300.00,
    fornecedorNome: 'Votorantim Cimentos S/A'
  }
];
