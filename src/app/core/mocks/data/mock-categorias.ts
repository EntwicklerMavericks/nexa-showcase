export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  empresaId: number;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nome: 'Material Básico',
    descricao: 'Cimento, areia, brita, blocos e tijolos',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 2,
    nome: 'Ferramentas',
    descricao: 'Ferramentas manuais, elétricas e EPIs',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 3,
    nome: 'Tintas e Acessórios',
    descricao: 'Tintas imobiliárias, solventes, pincéis e rolos',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 4,
    nome: 'Elétrica',
    descricao: 'Fios, cabos, disjuntores, lâmpadas e tomadas',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 5,
    nome: 'Hidráulica',
    descricao: 'Tubos, conexões, registros e caixas d\'água',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 6,
    nome: 'Pisos e Revestimentos',
    descricao: 'Porcelanatos, cerâmicas, argamassas e rejuntes',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 7,
    nome: 'Esquadrias',
    descricao: 'Portas, janelas, fechaduras e guarnições',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 8,
    nome: 'Louças e Metais',
    descricao: 'Vasos sanitários, pias, torneiras e chuveiros',
    ativo: true,
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  }
];
