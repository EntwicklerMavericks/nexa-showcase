export const MOCK_ENTREGAS_PENDENTES = [
  {
    id: 1,
    vendaId: 2,
    cargaId: null,
    status: 'PENDENTE',
    enderecoEntrega: 'Av. Alphaville, 2500, Alphaville',
    cidade: 'Barueri',
    estado: 'SP',
    cep: '06472-010',
    observacoes: 'Entregar tijolos e cimento. Descarregar próximo ao portão principal de obras.',
    venda: {
      numero: 'VND-000002',
      cliente: { nome: 'Construtora Vale Verde Ltda' }
    }
  },
  {
    id: 2,
    vendaId: 5,
    cargaId: null,
    status: 'PENDENTE',
    enderecoEntrega: 'Rua Augusta, 1800, Ap 54',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01304-001',
    observacoes: 'Entregar porcelanato e argamassa. Elevador de serviço disponível.',
    venda: {
      numero: 'VND-000005',
      cliente: { nome: 'Mário Sergio Nogueira' }
    }
  }
];

export const MOCK_CARGAS = [
  {
    id: 1,
    numero: 'CRG-2026-0001',
    motorista: 'João Silva',
    placaVeiculo: 'ABC-1234',
    status: 'EM_ROTA',
    dataSaida: '2026-03-05T08:00:00Z',
    observacoes: 'Entrega rápida na região central.',
    entregas: [
      {
        id: 3,
        vendaId: 1,
        status: 'EM_TRANSITO',
        enderecoEntrega: 'Rua das Flores, 123, Jardim Paulista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-000',
        venda: {
          numero: 'VND-000001',
          cliente: { nome: 'Carlos Eduardo Souza' }
        }
      }
    ],
    romaneioCarregamento: 'Romaneio carregado em 05/03/2026'
  },
  {
    id: 2,
    numero: 'CRG-2026-0002',
    motorista: 'Marcos Oliveira',
    placaVeiculo: 'XYZ-9876',
    status: 'ENTREGUE',
    dataSaida: '2026-03-04T09:30:00Z',
    observacoes: 'Carga de cimento concluída.',
    entregas: [
      {
        id: 4,
        vendaId: 4,
        status: 'ENTREGUE',
        enderecoEntrega: 'Rua Augusta, 1800, Ap 54',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01304-001',
        venda: {
          numero: 'VND-000004',
          cliente: { nome: 'Carlos Eduardo Souza' }
        }
      }
    ],
    romaneioCarregamento: 'Romaneio carregado em 04/03/2026'
  }
];
