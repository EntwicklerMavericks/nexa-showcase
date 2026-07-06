export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'CAIXA';
  ativo: boolean;
  avatarUrl?: string;
  empresaId: number | null;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 1,
    nome: 'Desenvolvedor Pleno Demo',
    email: 'demo@nexa.com',
    role: 'SUPER_ADMIN',
    ativo: true,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NexaAdmin',
    empresaId: 1,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 2,
    nome: 'Marcos Gerente',
    email: 'marcos@nexa.com',
    role: 'GERENTE',
    ativo: true,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marcos',
    empresaId: 1,
    createdAt: '2026-01-11T09:00:00Z',
    updatedAt: '2026-01-11T09:00:00Z'
  },
  {
    id: 3,
    nome: 'Alice Vendedora',
    email: 'alice@nexa.com',
    role: 'VENDEDOR',
    ativo: true,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice',
    empresaId: 1,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 4,
    nome: 'Lucas Caixa',
    email: 'lucas@nexa.com',
    role: 'CAIXA',
    ativo: true,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucas',
    empresaId: 1,
    createdAt: '2026-01-12T11:00:00Z',
    updatedAt: '2026-01-12T11:00:00Z'
  }
];
