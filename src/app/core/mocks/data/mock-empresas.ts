export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  logo: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_EMPRESAS: Empresa[] = [
  {
    id: 1,
    razaoSocial: 'Nexa Materiais de Construção Ltda',
    nomeFantasia: 'Nexa Materiais de Construção',
    cnpj: '00.111.222/0001-33',
    ie: '123.456.789-00',
    endereco: 'Avenida do Estado, 5000, Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01108-000',
    telefone: '(11) 3333-4444',
    email: 'contato@nexamateriais.com.br',
    logo: '/assets/images/logo.png',
    ativo: true,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  }
];
