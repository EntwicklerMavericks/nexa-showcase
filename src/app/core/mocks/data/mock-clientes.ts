export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  tipo: 'FISICA' | 'JURIDICA';
  ie: string | null;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string | null;
  limiteCredito: number;
  saldoDevedor: number;
  ativo: boolean;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 1,
    nome: 'Carlos Eduardo Souza',
    cpfCnpj: '123.456.789-00',
    tipo: 'FISICA',
    ie: null,
    email: 'carlos.souza@gmail.com',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123, Jardim Paulista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-000',
    observacoes: 'Cliente vip de materiais de construção, costuma comprar em grandes volumes.',
    limiteCredito: 5000.00,
    saldoDevedor: 1200.00,
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 2,
    nome: 'Construtora Vale Verde Ltda',
    cpfCnpj: '12.345.678/0001-99',
    tipo: 'JURIDICA',
    ie: '123.456.789.111',
    email: 'compras@valeverde.com.br',
    telefone: '(11) 4002-8922',
    endereco: 'Av. Paulista, 1000, 15º Andar',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01311-100',
    observacoes: 'Faturamento quinzenal de blocos e cimento.',
    limiteCredito: 50000.00,
    saldoDevedor: 15400.00,
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-20T14:30:00Z',
    updatedAt: '2026-01-20T14:30:00Z'
  },
  {
    id: 3,
    nome: 'Ana Julia Pereira',
    cpfCnpj: '987.654.321-11',
    tipo: 'FISICA',
    ie: null,
    email: 'ana.julia@hotmail.com',
    telefone: '(11) 99887-7665',
    endereco: 'Alameda Campinas, 45, Casa 2',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01404-000',
    observacoes: 'Compra em fiado com vencimento todo dia 10.',
    limiteCredito: 2500.00,
    saldoDevedor: 350.00,
    ativo: true,
    empresaId: 1,
    createdAt: '2026-02-01T09:15:00Z',
    updatedAt: '2026-02-01T09:15:00Z'
  },
  {
    id: 4,
    nome: 'Mário Sergio Nogueira',
    cpfCnpj: '456.789.012-34',
    tipo: 'FISICA',
    ie: null,
    email: 'mario.sergio@outlook.com',
    telefone: '(11) 97654-3210',
    endereco: 'Rua Augusta, 1800, Ap 54',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01304-001',
    observacoes: 'Engenheiro autônomo, indica diversos clientes.',
    limiteCredito: 10000.00,
    saldoDevedor: 0.00,
    ativo: true,
    empresaId: 1,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z'
  },
  {
    id: 5,
    nome: 'Empreiteira Rocha Forte Eireli',
    cpfCnpj: '98.765.432/0001-10',
    tipo: 'JURIDICA',
    ie: '987.654.321.000',
    email: 'financeiro@rochaforte.com',
    telefone: '(11) 3222-1111',
    endereco: 'Rua dos Trilhos, 800, Mooca',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '03168-010',
    observacoes: 'Sem restrições de compras, pagamento via PIX.',
    limiteCredito: 30000.00,
    saldoDevedor: 0.00,
    ativo: true,
    empresaId: 1,
    createdAt: '2026-02-18T16:00:00Z',
    updatedAt: '2026-02-18T16:00:00Z'
  }
];
