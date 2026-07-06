export interface Fornecedor {
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
  ativo: boolean;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_FORNECEDORES: Fornecedor[] = [
  {
    id: 1,
    nome: 'Votorantim Cimentos S/A',
    cpfCnpj: '33.348.696/0001-15',
    tipo: 'JURIDICA',
    ie: '110.220.330.440',
    email: 'vendas@votorantim.com.br',
    telefone: '0800-701-2400',
    endereco: 'Praça Albert Einstein, 100, Morumbi',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '05652-000',
    observacoes: 'Fornecedor principal de cimento e argamassas.',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 2,
    nome: 'Tigre Materiais de Construção S/A',
    cpfCnpj: '84.685.294/0001-88',
    tipo: 'JURIDICA',
    ie: '220.330.440.550',
    email: 'faturamento@tigre.com.br',
    telefone: '0800-701-8888',
    endereco: 'Rua Xavantes, 1500, Atiradores',
    cidade: 'Joinville',
    estado: 'SC',
    cep: '89203-900',
    observacoes: 'Distribuidora oficial de tubos e conexões de PVC.',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 3,
    nome: 'Robert Bosch Ltda',
    cpfCnpj: '45.999.888/0001-20',
    tipo: 'JURIDICA',
    ie: '330.440.550.660',
    email: 'bosch-vendas@bosch.com',
    telefone: '(19) 2103-1111',
    endereco: 'Rodovia Anhanguera, km 98, Vila Bosch',
    cidade: 'Campinas',
    estado: 'SP',
    cep: '13065-900',
    observacoes: 'Fornecedor de ferramentas elétricas e acessórios.',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 4,
    nome: 'Cerâmica Portobello S/A',
    cpfCnpj: '83.475.986/0001-30',
    tipo: 'JURIDICA',
    ie: '440.550.660.770',
    email: 'sac@portobello.com.br',
    telefone: '0800-648-2000',
    endereco: 'BR 101, Km 163, Alto Timbé',
    cidade: 'Tijucas',
    estado: 'SC',
    cep: '88200-000',
    observacoes: 'Fornecedor de porcelanatos, pisos e revestimentos.',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  }
];
