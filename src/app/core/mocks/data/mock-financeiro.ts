export const MOCK_FINANCEIRO_DASHBOARD = {
  lucroReal: {
    total: 8450.00,
    receita: 18900.00,
    cmv: 6450.00,
    despesas: 4000.00
  },
  receberAtrasado: 1200.00,
  pagarAtrasado: 450.00,
  saldoCaixa: 14450.00,
  proximosVencimentos: [
    {
      tipo: 'RECEBER',
      descricao: 'Parcela 2/3 - Venda VND-000002',
      cliente: { nome: 'Construtora Vale Verde Ltda' },
      valor: 2883.33,
      vencimento: '2026-04-02T10:15:00Z',
      status: 'PENDENTE'
    },
    {
      tipo: 'PAGAR',
      descricao: 'Compra de Ferramentas - OC-000002',
      fornecedor: { nome: 'Robert Bosch Ltda' },
      valor: 1500.00,
      vencimento: '2026-03-30T14:00:00Z',
      status: 'PENDENTE'
    },
    {
      tipo: 'RECEBER',
      descricao: 'Fatura Fiado - Fevereiro',
      cliente: { nome: 'Ana Julia Pereira' },
      valor: 350.00,
      vencimento: '2026-03-10T18:00:00Z',
      status: 'ATRASADO'
    }
  ]
};

export const MOCK_CONTAS_RECEBER = [
  {
    id: 1,
    descricao: 'Parcela 1/1 - Venda VND-000001',
    cliente: { id: 1, nome: 'Carlos Eduardo Souza' },
    parcela: 1,
    valor: 350.00,
    vencimento: '2026-03-01T14:00:00Z',
    status: 'PAGO',
    vendaId: 1
  },
  {
    id: 2,
    descricao: 'Parcela 1/3 - Venda VND-000002',
    cliente: { id: 2, nome: 'Construtora Vale Verde Ltda' },
    parcela: 1,
    valor: 2883.34,
    vencimento: '2026-03-02T10:15:00Z',
    status: 'PENDENTE',
    vendaId: 2
  },
  {
    id: 3,
    descricao: 'Parcela 2/3 - Venda VND-000002',
    cliente: { id: 2, nome: 'Construtora Vale Verde Ltda' },
    parcela: 2,
    valor: 2883.33,
    vencimento: '2026-04-02T10:15:00Z',
    status: 'PENDENTE',
    vendaId: 2
  },
  {
    id: 4,
    descricao: 'Parcela 3/3 - Venda VND-000002',
    cliente: { id: 2, nome: 'Construtora Vale Verde Ltda' },
    parcela: 3,
    valor: 2883.33,
    vencimento: '2026-05-02T10:15:00Z',
    status: 'PENDENTE',
    vendaId: 2
  },
  {
    id: 5,
    descricao: 'Fatura Fiado - Fevereiro',
    cliente: { id: 3, nome: 'Ana Julia Pereira' },
    parcela: 1,
    valor: 350.00,
    vencimento: '2026-03-10T18:00:00Z',
    status: 'ATRASADO',
    vendaId: 3
  }
];

export const MOCK_CONTAS_PAGAR = [
  {
    id: 1,
    descricao: 'Compra de Cimento - OC-000001',
    fornecedor: { id: 1, nome: 'Votorantim Cimentos S/A' },
    parcela: 1,
    valor: 2900.00,
    vencimento: '2026-02-15T09:00:00Z',
    status: 'PAGO',
    compraId: 1
  },
  {
    id: 2,
    descricao: 'Compra de Ferramentas - OC-000002',
    fornecedor: { id: 3, nome: 'Robert Bosch Ltda' },
    parcela: 1,
    valor: 1500.00,
    vencimento: '2026-03-30T14:00:00Z',
    status: 'PENDENTE',
    compraId: 2
  },
  {
    id: 3,
    descricao: 'Aluguel do Galpão Comercial',
    fornecedor: null,
    parcela: 1,
    valor: 2500.00,
    vencimento: '2026-03-05T18:00:00Z',
    status: 'PAGO',
    compraId: null
  },
  {
    id: 4,
    descricao: 'Conta de Energia Elétrica Enel',
    fornecedor: null,
    parcela: 1,
    valor: 450.00,
    vencimento: '2026-03-02T18:00:00Z',
    status: 'ATRASADO',
    compraId: null
  }
];
