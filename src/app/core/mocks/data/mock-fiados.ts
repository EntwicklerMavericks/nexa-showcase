export const MOCK_FIADOS_RESUMO = [
  {
    cliente: {
      id: 1,
      nome: 'Carlos Eduardo Souza',
      telefone: '(11) 98765-4321',
      cpfCnpj: '123.456.789-00'
    },
    saldoDevedorTotal: 1200.00,
    saldoAtrasado: 0.00,
    quantidadeTitulos: 2,
    titulosAtrasados: 0
  },
  {
    cliente: {
      id: 3,
      nome: 'Ana Julia Pereira',
      telefone: '(11) 99887-7665',
      cpfCnpj: '987.654.321-11'
    },
    saldoDevedorTotal: 350.00,
    saldoAtrasado: 350.00,
    quantidadeTitulos: 1,
    titulosAtrasados: 1
  }
];

export const MOCK_FIADOS_DETALHES: Record<number, any[]> = {
  1: [
    {
      id: 101,
      descricao: 'Fiado Parcela 1/2 - VND-000008',
      valor: 600.00,
      vencimento: '2026-03-20T18:00:00Z',
      status: 'PENDENTE',
      createdAt: '2026-02-20T10:00:00Z'
    },
    {
      id: 102,
      descricao: 'Fiado Parcela 2/2 - VND-000008',
      valor: 600.00,
      vencimento: '2026-04-20T18:00:00Z',
      status: 'PENDENTE',
      createdAt: '2026-02-20T10:00:00Z'
    }
  ],
  3: [
    {
      id: 5,
      descricao: 'Fatura Fiado - Fevereiro',
      valor: 350.00,
      vencimento: '2026-03-10T18:00:00Z',
      status: 'ATRASADO',
      createdAt: '2026-02-10T14:00:00Z'
    }
  ]
};
