import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import { MOCK_CATEGORIAS } from './data/mock-categorias';
import { MOCK_PRODUTOS } from './data/mock-produtos';
import { MOCK_CLIENTES } from './data/mock-clientes';
import { MOCK_FORNECEDORES } from './data/mock-fornecedores';
import { MOCK_VENDAS } from './data/mock-vendas';
import { MOCK_COMPRAS } from './data/mock-compras';
import { MOCK_ORCAMENTOS } from './data/mock-orcamentos';
import { MOCK_NFES } from './data/mock-nfe';
import { MOCK_FINANCEIRO_DASHBOARD, MOCK_CONTAS_RECEBER, MOCK_CONTAS_PAGAR } from './data/mock-financeiro';
import { MOCK_ESTOQUE_HISTORICO, MOCK_ESTOQUE_ALERTAS, MOCK_ESTOQUE_REPOSICAO } from './data/mock-estoque';
import { MOCK_ENTREGAS_PENDENTES, MOCK_CARGAS } from './data/mock-logistica';
import { MOCK_USUARIOS } from './data/mock-usuarios';
import { MOCK_EMPRESAS } from './data/mock-empresas';
import { MOCK_FIADOS_RESUMO, MOCK_FIADOS_DETALHES } from './data/mock-fiados';
import { generateDre, generateTopProdutos, generateVendasPeriodo, generateFluxoCaixa } from './data/mock-relatorios';

// Estados mutáveis em memória para simular inserção/edição/deleção durante a sessão da demo
let dbCategorias = [...MOCK_CATEGORIAS];
let dbProdutos = [...MOCK_PRODUTOS];
let dbClientes = [...MOCK_CLIENTES];
let dbFornecedores = [...MOCK_FORNECEDORES];
let dbVendas = [...MOCK_VENDAS];
let dbCompras = [...MOCK_COMPRAS];
let dbOrcamentos = [...MOCK_ORCAMENTOS];
let dbNfes = [...MOCK_NFES];
let dbContasReceber = [...MOCK_CONTAS_RECEBER];
let dbContasPagar = [...MOCK_CONTAS_PAGAR];
let dbEntregasPendentes = [...MOCK_ENTREGAS_PENDENTES];
let dbCargas = [...MOCK_CARGAS];
let dbUsuarios = [...MOCK_USUARIOS];
let dbEmpresas = [...MOCK_EMPRESAS];

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  const method = req.method;

  console.log(`[MockInterceptor] Interceptado: ${method} ${url}`);

  // Helpers para extrair query params
  const getParam = (name: string): string | null => req.params.get(name);
  const getPage = (): number => parseInt(getParam('page') || '1', 10);
  const getLimit = (): number => parseInt(getParam('limit') || '20', 10);
  const getSearch = (): string => (getParam('search') || '').toLowerCase().trim();

  // Helper para simular paginação
  const paginate = <T>(array: T[], page: number, limit: number) => {
    const offset = (page - 1) * limit;
    return array.slice(offset, offset + limit);
  };

  // Helper para criar resposta mock envelopada (formato ApiResponse esperado pelo responseInterceptor)
  const sendOk = (data: any) => {
    return of(new HttpResponse({
      status: 200,
      body: { success: true, data }
    })).pipe(delay(250)); // Simula latência de rede realista
  };

  // Helper para simular erro HTTP
  const sendError = (status: number, message: string) => {
    return throwError(() => new HttpErrorResponse({
      status,
      statusText: 'Error',
      error: { success: false, message }
    })).pipe(delay(250));
  };

  // ─── 1. AUTHENTICATION ─────────────────────────────────────────────────────
  if (url.includes('/auth/check-email')) {
    const email = getParam('email') || '';
    const exists = dbUsuarios.some(u => u.email === email);
    return sendOk({ exists });
  }

  if (url.includes('/auth/login')) {
    const body = req.body as any;
    const user = dbUsuarios.find(u => u.email === body.email);
    
    // Qualquer senha passa para fins de demo
    if (user) {
      return sendOk({
        accessToken: 'mock-access-token-jwt-payload',
        refreshToken: 'mock-refresh-token-jwt-payload',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          empresaId: user.empresaId,
          plano: 'PREMIUM' // Desbloqueia tudo na demo
        }
      });
    }
    // Credencial padrão caso digitem qualquer outra coisa
    return sendOk({
      accessToken: 'mock-access-token-jwt-payload',
      refreshToken: 'mock-refresh-token-jwt-payload',
      user: {
        id: 1,
        nome: 'Desenvolvedor Pleno Demo',
        email: body.email || 'demo@nexa.com',
        role: 'SUPER_ADMIN',
        empresaId: 1,
        plano: 'PREMIUM'
      }
    });
  }

  if (url.includes('/auth/register-tenant')) {
    const body = req.body as any;
    const newId = dbUsuarios.length + 1;
    const newUser = {
      id: newId,
      nome: body.nome || 'Usuário Demo',
      email: body.email,
      role: 'SUPER_ADMIN' as const,
      ativo: true,
      empresaId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbUsuarios.push(newUser);
    return sendOk({
      accessToken: 'mock-access-token-jwt-payload',
      refreshToken: 'mock-refresh-token-jwt-payload',
      user: {
        ...newUser,
        plano: body.plano || 'PREMIUM'
      }
    });
  }

  if (url.includes('/auth/refresh')) {
    return sendOk({
      accessToken: 'mock-new-access-token',
      refreshToken: 'mock-new-refresh-token'
    });
  }

  if (url.includes('/auth/logout')) {
    return sendOk({});
  }

  // ─── 2. NOTIFICATIONS & SSE ────────────────────────────────────────────────
  if (url.includes('/notifications/counts')) {
    return sendOk({
      type: 'initial',
      data: {
        Estoque: MOCK_ESTOQUE_ALERTAS.length,
        Logística: dbEntregasPendentes.length,
        'Fiados / Caderneta': MOCK_FIADOS_RESUMO.length
      }
    });
  }

  if (url.includes('/notifications/sse')) {
    // Retorna um observable vazio para simular que o canal SSE está aberto e inativo
    return of();
  }

  // ─── 3. CATEGORIAS ─────────────────────────────────────────────────────────
  if (url.endsWith('/categorias')) {
    if (method === 'GET') {
      const search = getSearch();
      let filtered = dbCategorias;
      if (search) {
        filtered = dbCategorias.filter(c => c.nome.toLowerCase().includes(search));
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const newCat = {
        id: dbCategorias.length + 1,
        nome: body.nome,
        descricao: body.descricao || '',
        ativo: true,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbCategorias.push(newCat);
      return sendOk(newCat);
    }
  }

  if (url.includes('/categorias/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const cat = dbCategorias.find(c => c.id === id);
      return cat ? sendOk(cat) : sendError(404, 'Categoria não encontrada');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbCategorias.findIndex(c => c.id === id);
      if (index !== -1) {
        dbCategorias[index] = { ...dbCategorias[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbCategorias[index]);
      }
      return sendError(404, 'Categoria não encontrada');
    }
    if (method === 'DELETE') {
      dbCategorias = dbCategorias.filter(c => c.id !== id);
      return sendOk({});
    }
  }

  // ─── 4. PRODUTOS ───────────────────────────────────────────────────────────
  if (url.endsWith('/produtos')) {
    if (method === 'GET') {
      const search = getSearch();
      const categoriaId = getParam('categoriaId');
      let filtered = dbProdutos;
      if (search) {
        filtered = dbProdutos.filter(p => 
          p.nome.toLowerCase().includes(search) || 
          p.sku.toLowerCase().includes(search) || 
          (p.codigoBarras && p.codigoBarras.includes(search))
        );
      }
      if (categoriaId) {
        const catId = parseInt(categoriaId, 10);
        filtered = filtered.filter(p => p.categoriaId === catId);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const cat = dbCategorias.find(c => c.id === body.categoriaId) || { id: body.categoriaId, nome: 'Geral' };
      const newProd = {
        id: dbProdutos.length + 1,
        nome: body.nome,
        descricao: body.descricao || '',
        sku: body.sku,
        codigoBarras: body.codigoBarras || null,
        unidade: body.unidade || 'UN',
        precoCusto: body.precoCusto,
        precoVenda: body.precoVenda,
        margemLucro: body.precoCusto ? parseFloat((((body.precoVenda - body.precoCusto) / body.precoCusto) * 100).toFixed(2)) : 100,
        ncm: body.ncm || null,
        cfop: body.cfop || null,
        cst: body.cst || null,
        estoqueMinimo: body.estoqueMinimo || 0,
        estoqueAtual: body.estoqueAtual || 0,
        ativo: true,
        categoriaId: body.categoriaId,
        categoria: { id: cat.id, nome: cat.nome },
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbProdutos.push(newProd);
      return sendOk(newProd);
    }
  }

  if (url.includes('/produtos/importar')) {
    // Simula importação de planilha de produtos com sucesso
    return sendOk({ importedCount: 15 });
  }

  if (url.includes('/produtos/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const prod = dbProdutos.find(p => p.id === id);
      return prod ? sendOk(prod) : sendError(404, 'Produto não encontrado');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbProdutos.findIndex(p => p.id === id);
      if (index !== -1) {
        dbProdutos[index] = { ...dbProdutos[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbProdutos[index]);
      }
      return sendError(404, 'Produto não encontrado');
    }
    if (method === 'DELETE') {
      dbProdutos = dbProdutos.filter(p => p.id !== id);
      return sendOk({});
    }
  }

  // ─── 5. CLIENTES ───────────────────────────────────────────────────────────
  if (url.endsWith('/clientes')) {
    if (method === 'GET') {
      const search = getSearch();
      const tipo = getParam('tipo');
      let filtered = dbClientes;
      if (search) {
        filtered = dbClientes.filter(c => 
          c.nome.toLowerCase().includes(search) || 
          c.cpfCnpj.includes(search)
        );
      }
      if (tipo) {
        filtered = filtered.filter(c => c.tipo === tipo);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const newCli = {
        id: dbClientes.length + 1,
        nome: body.nome,
        cpfCnpj: body.cpfCnpj,
        tipo: body.tipo || 'FISICA',
        ie: body.ie || null,
        email: body.email || '',
        telefone: body.telefone || '',
        endereco: body.endereco || '',
        cidade: body.cidade || '',
        estado: body.estado || '',
        cep: body.cep || '',
        observacoes: body.observacoes || null,
        limiteCredito: body.limiteCredito || 0,
        saldoDevedor: 0,
        ativo: true,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbClientes.push(newCli);
      return sendOk(newCli);
    }
  }

  if (url.includes('/clientes/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const cli = dbClientes.find(c => c.id === id);
      return cli ? sendOk(cli) : sendError(404, 'Cliente não encontrado');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbClientes.findIndex(c => c.id === id);
      if (index !== -1) {
        dbClientes[index] = { ...dbClientes[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbClientes[index]);
      }
      return sendError(404, 'Cliente não encontrado');
    }
    if (method === 'DELETE') {
      dbClientes = dbClientes.filter(c => c.id !== id);
      return sendOk({});
    }
  }

  // ─── 6. VENDAS ─────────────────────────────────────────────────────────────
  if (url.endsWith('/vendas')) {
    if (method === 'GET') {
      const search = getSearch();
      const status = getParam('status');
      let filtered = dbVendas;
      if (search) {
        filtered = dbVendas.filter(v => 
          v.numero.toLowerCase().includes(search) || 
          (v.cliente && v.cliente.nome.toLowerCase().includes(search))
        );
      }
      if (status) {
        filtered = filtered.filter(v => v.status === status);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const cli = dbClientes.find(c => c.id === body.clienteId) || { id: 1, nome: 'Consumidor Final', cpfCnpj: '000.000.000-00' };
      const numStr = String(dbVendas.length + 1).padStart(6, '0');
      
      const newVenda = {
        id: dbVendas.length + 1,
        numero: `VND-${numStr}`,
        clienteId: body.clienteId || 1,
        cliente: { id: cli.id, nome: cli.nome, cpfCnpj: cli.cpfCnpj },
        status: body.status || 'PAGO',
        dataVenda: new Date().toISOString(),
        formaPagamento: body.formaPagamento || 'PIX',
        parcelas: body.parcelas || 1,
        valorProdutos: body.valorProdutos,
        valorDesconto: body.valorDesconto || 0,
        valorFrete: body.valorFrete || 0,
        valorTotal: body.valorTotal,
        observacoes: body.observacoes || null,
        vendedorId: 1,
        notaFiscalId: null,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itens: (body.itens || []).map((item: any, idx: number) => {
          const prod = dbProdutos.find(p => p.id === item.produtoId);
          return {
            id: idx + 1,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorDesconto: item.valorDesconto || 0,
            valorTotal: item.valorTotal,
            produto: prod ? { id: prod.id, nome: prod.nome, sku: prod.sku, precoVenda: prod.precoVenda } : undefined
          };
        })
      };
      
      dbVendas.push(newVenda);

      // Simular atualização de estoque para os itens vendidos
      (body.itens || []).forEach((item: any) => {
        const prod = dbProdutos.find(p => p.id === item.produtoId);
        if (prod) {
          prod.estoqueAtual = Math.max(0, prod.estoqueAtual - item.quantidade);
        }
      });

      // Se for fiado, simular o débito no saldo do cliente
      if (body.formaPagamento === 'FIADO') {
        const index = dbClientes.findIndex(c => c.id === body.clienteId);
        if (index !== -1) {
          dbClientes[index].saldoDevedor += body.valorTotal;
        }
        // Adicionar conta a receber
        dbContasReceber.push({
          id: dbContasReceber.length + 1,
          descricao: `Fatura Fiado - Venda VND-${numStr}`,
          cliente: { id: cli.id, nome: cli.nome },
          parcela: 1,
          valor: body.valorTotal,
          vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDENTE',
          vendaId: newVenda.id
        });
      }

      return sendOk(newVenda);
    }
  }

  if (url.includes('/vendas/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const venda = dbVendas.find(v => v.id === id);
      return venda ? sendOk(venda) : sendError(404, 'Venda não encontrada');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbVendas.findIndex(v => v.id === id);
      if (index !== -1) {
        dbVendas[index] = { ...dbVendas[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbVendas[index]);
      }
      return sendError(404, 'Venda não encontrada');
    }
    if (method === 'DELETE') {
      dbVendas = dbVendas.filter(v => v.id !== id);
      return sendOk({});
    }
  }

  // ─── 7. COMPRAS ────────────────────────────────────────────────────────────
  if (url.endsWith('/compras')) {
    if (method === 'GET') {
      const search = getSearch();
      const status = getParam('status');
      let filtered = dbCompras;
      if (search) {
        filtered = dbCompras.filter(c => 
          c.numero.toLowerCase().includes(search) || 
          (c.fornecedor && c.fornecedor.nome.toLowerCase().includes(search))
        );
      }
      if (status) {
        filtered = filtered.filter(c => c.status === status);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const forn = dbFornecedores.find(f => f.id === body.fornecedorId) || { id: 1, nome: 'Fornecedor Geral' };
      const numStr = String(dbCompras.length + 1).padStart(6, '0');
      
      const newCompra = {
        id: dbCompras.length + 1,
        numero: `OC-${numStr}`,
        fornecedorId: body.fornecedorId,
        fornecedor: { id: forn.id, nome: forn.nome },
        status: body.status || 'PENDENTE',
        dataCompra: new Date().toISOString(),
        formaPagamento: body.formaPagamento || 'BOLETO',
        parcelas: body.parcelas || 1,
        valorProdutos: body.valorProdutos,
        valorDesconto: body.valorDesconto || 0,
        valorFrete: body.valorFrete || 0,
        valorTotal: body.valorTotal,
        observacoes: body.observacoes || null,
        compradorId: 1,
        notaFiscalId: null,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itens: (body.itens || []).map((item: any, idx: number) => {
          return {
            id: idx + 1,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal
          };
        })
      };
      
      dbCompras.push(newCompra);

      // Se status for RECEBIDO, incrementa estoque e gera contas a pagar
      if (newCompra.status === 'RECEBIDO') {
        (body.itens || []).forEach((item: any) => {
          const prod = dbProdutos.find(p => p.id === item.produtoId);
          if (prod) {
            prod.estoqueAtual += item.quantidade;
          }
        });
      }

      // Adicionar contas a pagar
      dbContasPagar.push({
        id: dbContasPagar.length + 1,
        descricao: `Compra de insumos - OC-${numStr}`,
        fornecedor: { id: forn.id, nome: forn.nome },
        parcela: 1,
        valor: body.valorTotal,
        vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDENTE',
        compraId: newCompra.id
      });

      return sendOk(newCompra);
    }
  }

  if (url.includes('/compras/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const compra = dbCompras.find(c => c.id === id);
      return compra ? sendOk(compra) : sendError(404, 'Ordem de compra não encontrada');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbCompras.findIndex(c => c.id === id);
      if (index !== -1) {
        dbCompras[index] = { ...dbCompras[index], ...body, updatedAt: new Date().toISOString() };
        // Se mudou status para RECEBIDO, incrementa estoque dos produtos
        if (body.status === 'RECEBIDO') {
          const itens = dbCompras[index].itens || [];
          itens.forEach((item: any) => {
            const prod = dbProdutos.find(p => p.id === item.produtoId);
            if (prod) {
              prod.estoqueAtual += item.quantidade;
            }
          });
        }
        return sendOk(dbCompras[index]);
      }
      return sendError(404, 'Ordem de compra não encontrada');
    }
  }

  // ─── 8. FORNECEDORES ───────────────────────────────────────────────────────
  if (url.endsWith('/fornecedores')) {
    if (method === 'GET') {
      const search = getSearch();
      let filtered = dbFornecedores;
      if (search) {
        filtered = dbFornecedores.filter(f => 
          f.nome.toLowerCase().includes(search) || 
          f.cpfCnpj.includes(search)
        );
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const newForn = {
        id: dbFornecedores.length + 1,
        nome: body.nome,
        cpfCnpj: body.cpfCnpj,
        tipo: body.tipo || 'JURIDICA',
        ie: body.ie || null,
        email: body.email || '',
        telefone: body.telefone || '',
        endereco: body.endereco || '',
        cidade: body.cidade || '',
        estado: body.estado || '',
        cep: body.cep || '',
        observacoes: body.observacoes || null,
        ativo: true,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbFornecedores.push(newForn);
      return sendOk(newForn);
    }
  }

  if (url.includes('/fornecedores/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const forn = dbFornecedores.find(f => f.id === id);
      return forn ? sendOk(forn) : sendError(404, 'Fornecedor não encontrado');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbFornecedores.findIndex(f => f.id === id);
      if (index !== -1) {
        dbFornecedores[index] = { ...dbFornecedores[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbFornecedores[index]);
      }
      return sendError(404, 'Fornecedor não encontrado');
    }
    if (method === 'DELETE') {
      dbFornecedores = dbFornecedores.filter(f => f.id !== id);
      return sendOk({});
    }
  }

  // ─── 9. ORÇAMENTOS ─────────────────────────────────────────────────────────
  if (url.endsWith('/orcamentos')) {
    if (method === 'GET') {
      const search = getSearch();
      const status = getParam('status');
      let filtered = dbOrcamentos;
      if (search) {
        filtered = dbOrcamentos.filter(o => 
          o.numero.toLowerCase().includes(search) || 
          (o.cliente && o.cliente.nome.toLowerCase().includes(search))
        );
      }
      if (status) {
        filtered = filtered.filter(o => o.status === status);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const cli = dbClientes.find(c => c.id === body.clienteId) || { id: 1, nome: 'Consumidor Final', cpfCnpj: '000.000.000-00' };
      const numStr = String(dbOrcamentos.length + 1).padStart(6, '0');
      
      const newOrcamento = {
        id: dbOrcamentos.length + 1,
        numero: `ORC-${numStr}`,
        clienteId: body.clienteId || 1,
        cliente: { id: cli.id, nome: cli.nome, cpfCnpj: cli.cpfCnpj },
        status: 'PENDENTE',
        dataOrcamento: new Date().toISOString(),
        validade: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        valorProdutos: body.valorProdutos,
        valorDesconto: body.valorDesconto || 0,
        valorFrete: body.valorFrete || 0,
        valorTotal: body.valorTotal,
        observacoes: body.observacoes || null,
        vendedorId: 1,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itens: (body.itens || []).map((item: any, idx: number) => {
          const prod = dbProdutos.find(p => p.id === item.produtoId);
          return {
            id: idx + 1,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorDesconto: item.valorDesconto || 0,
            valorTotal: item.valorTotal,
            produto: prod ? { id: prod.id, nome: prod.nome, sku: prod.sku, precoVenda: prod.precoVenda } : undefined
          };
        })
      };
      
      dbOrcamentos.push(newOrcamento as any);
      return sendOk(newOrcamento);
    }
  }

  if (url.includes('/orcamentos/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    
    if (url.endsWith('/enviar')) {
      const index = dbOrcamentos.findIndex(o => o.id === id);
      if (index !== -1) {
        dbOrcamentos[index].status = 'ENVIADO';
        return sendOk(dbOrcamentos[index]);
      }
      return sendError(404, 'Orçamento não encontrado');
    }

    if (url.endsWith('/converter')) {
      const index = dbOrcamentos.findIndex(o => o.id === id);
      if (index !== -1) {
        dbOrcamentos[index].status = 'APROVADO';
        
        // Simular a criação de uma Venda a partir do orçamento
        const orc = dbOrcamentos[index];
        const numStr = String(dbVendas.length + 1).padStart(6, '0');
        const newVenda = {
          id: dbVendas.length + 1,
          numero: `VND-${numStr}`,
          clienteId: orc.clienteId,
          cliente: orc.cliente,
          status: 'PENDENTE',
          dataVenda: new Date().toISOString(),
          formaPagamento: 'PIX',
          parcelas: 1,
          valorProdutos: orc.valorProdutos,
          valorDesconto: orc.valorDesconto,
          valorFrete: orc.valorFrete,
          valorTotal: orc.valorTotal,
          observacoes: `Convertido do orçamento ${orc.numero}`,
          vendedorId: 1,
          notaFiscalId: null,
          empresaId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          itens: orc.itens
        };
        dbVendas.push(newVenda as any);
        return sendOk(dbOrcamentos[index]);
      }
      return sendError(404, 'Orçamento não encontrado');
    }

    if (method === 'GET') {
      const orc = dbOrcamentos.find(o => o.id === id);
      return orc ? sendOk(orc) : sendError(404, 'Orçamento não encontrado');
    }

    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbOrcamentos.findIndex(o => o.id === id);
      if (index !== -1) {
        dbOrcamentos[index] = { ...dbOrcamentos[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbOrcamentos[index]);
      }
      return sendError(404, 'Orçamento não encontrado');
    }

    if (method === 'DELETE') {
      dbOrcamentos = dbOrcamentos.filter(o => o.id !== id);
      return sendOk({});
    }
  }

  // ─── 10. NOTAS FISCAIS ─────────────────────────────────────────────────────
  if (url.endsWith('/notas-fiscais')) {
    if (method === 'GET') {
      const search = getSearch();
      const status = getParam('status');
      let filtered = dbNfes;
      if (search) {
        filtered = dbNfes.filter(n => n.numero.includes(search));
      }
      if (status) {
        filtered = filtered.filter(n => n.status === status);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const numStr = String(dbNfes.length + 1).padStart(6, '0');
      const newNfe = {
        id: dbNfes.length + 1,
        numero: numStr,
        serie: '001',
        chaveAcesso: `3526031234567800019955001000000${numStr}1000000${numStr}9`,
        naturezaOperacao: body.naturezaOperacao || 'Venda',
        tipoOperacao: body.tipoOperacao || 'SAIDA',
        status: 'RASCUNHO',
        dataEmissao: new Date().toISOString(),
        empresaId: 1,
        vendaId: body.vendaId || null,
        compraId: body.compraId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbNfes.push(newNfe as any);
      return sendOk(newNfe);
    }
  }

  if (url.includes('/notas-fiscais/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const nfe = dbNfes.find(n => n.id === id);
      return nfe ? sendOk(nfe) : sendError(404, 'NF-e não encontrada');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbNfes.findIndex(n => n.id === id);
      if (index !== -1) {
        dbNfes[index] = { ...dbNfes[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbNfes[index]);
      }
      return sendError(404, 'NF-e não encontrada');
    }
    if (method === 'DELETE') {
      dbNfes = dbNfes.filter(n => n.id !== id);
      return sendOk({});
    }
  }

  // ─── 11. FINANCEIRO ────────────────────────────────────────────────────────
  if (url.endsWith('/financeiro/dashboard')) {
    return sendOk(MOCK_FINANCEIRO_DASHBOARD);
  }

  if (url.endsWith('/financeiro/receber')) {
    if (method === 'GET') {
      const status = getParam('status');
      let filtered = dbContasReceber;
      if (status) {
        filtered = dbContasReceber.filter(c => c.status === status);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const cli = body.clienteId ? dbClientes.find(c => c.id === body.clienteId) : null;
      const newRec = {
        id: dbContasReceber.length + 1,
        descricao: body.descricao,
        cliente: cli ? { id: cli.id, nome: cli.nome } : null,
        parcela: body.parcela || 1,
        valor: body.valor,
        vencimento: body.vencimento,
        status: 'PENDENTE',
        vendaId: null
      };
      dbContasReceber.push(newRec as any);
      return sendOk(newRec);
    }
  }

  if (url.includes('/financeiro/receber/')) {
    const id = parseInt(url.split('/').filter(p => !isNaN(Number(p))).pop() || '0', 10);
    const index = dbContasReceber.findIndex(c => c.id === id);
    
    if (url.endsWith('/baixar') && index !== -1) {
      dbContasReceber[index].status = 'PAGO';
      // Atualizar saldo do cliente se aplicável
      const cliId = dbContasReceber[index].cliente?.id;
      if (cliId) {
        const cliIndex = dbClientes.findIndex(c => c.id === cliId);
        if (cliIndex !== -1) {
          dbClientes[cliIndex].saldoDevedor = Math.max(0, dbClientes[cliIndex].saldoDevedor - dbContasReceber[index].valor);
        }
      }
      return sendOk(dbContasReceber[index]);
    }
    if (url.endsWith('/estornar') && index !== -1) {
      dbContasReceber[index].status = 'PENDENTE';
      return sendOk(dbContasReceber[index]);
    }
    if (method === 'DELETE') {
      dbContasReceber = dbContasReceber.filter(c => c.id !== id);
      return sendOk({});
    }
  }

  if (url.endsWith('/financeiro/pagar')) {
    if (method === 'GET') {
      const status = getParam('status');
      let filtered = dbContasPagar;
      if (status) {
        filtered = dbContasPagar.filter(c => c.status === status);
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const forn = body.fornecedorId ? dbFornecedores.find(f => f.id === body.fornecedorId) : null;
      const newPag = {
        id: dbContasPagar.length + 1,
        descricao: body.descricao,
        fornecedor: forn ? { id: forn.id, nome: forn.nome } : null,
        parcela: body.parcela || 1,
        valor: body.valor,
        vencimento: body.vencimento,
        status: 'PENDENTE',
        compraId: null
      };
      dbContasPagar.push(newPag as any);
      return sendOk(newPag);
    }
  }

  if (url.includes('/financeiro/pagar/')) {
    const id = parseInt(url.split('/').filter(p => !isNaN(Number(p))).pop() || '0', 10);
    const index = dbContasPagar.findIndex(c => c.id === id);
    
    if (url.endsWith('/baixar') && index !== -1) {
      dbContasPagar[index].status = 'PAGO';
      return sendOk(dbContasPagar[index]);
    }
    if (url.endsWith('/estornar') && index !== -1) {
      dbContasPagar[index].status = 'PENDENTE';
      return sendOk(dbContasPagar[index]);
    }
    if (method === 'DELETE') {
      dbContasPagar = dbContasPagar.filter(c => c.id !== id);
      return sendOk({});
    }
  }

  // ─── 12. ESTOQUE ───────────────────────────────────────────────────────────
  if (url.endsWith('/estoque/movimentar')) {
    const body = req.body as any;
    const prod = dbProdutos.find(p => p.id === body.produtoId);
    if (prod) {
      if (body.tipo === 'ENTRADA') {
        prod.estoqueAtual += body.quantidade;
      } else {
        prod.estoqueAtual = Math.max(0, prod.estoqueAtual - body.quantidade);
      }
      
      // Registra no histórico em memória
      const hist = MOCK_ESTOQUE_HISTORICO[body.produtoId] || [];
      hist.unshift({
        id: Math.floor(Math.random() * 1000) + 10,
        produtoId: body.produtoId,
        tipo: body.tipo,
        quantidade: body.quantidade,
        valorUnitario: body.valorUnitario || prod.precoCusto,
        justificativa: body.justificativa || 'Ajuste manual',
        usuario: { nome: 'Desenvolvedor Pleno Demo' },
        createdAt: new Date().toISOString()
      });
      MOCK_ESTOQUE_HISTORICO[body.produtoId] = hist;

      return sendOk(prod);
    }
    return sendError(404, 'Produto não encontrado');
  }

  if (url.includes('/estoque/historico/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    const hist = MOCK_ESTOQUE_HISTORICO[id] || [];
    return sendOk(hist);
  }

  if (url.endsWith('/estoque/alertas')) {
    // Retorna alertas baseados nos estoques atuais
    const alertas = dbProdutos
      .filter(p => p.estoqueAtual <= p.estoqueMinimo)
      .map(p => ({
        id: p.id,
        nome: p.nome,
        sku: p.sku,
        estoqueMinimo: p.estoqueMinimo,
        estoqueAtual: p.estoqueAtual,
        unidade: p.unidade
      }));
    return sendOk(alertas);
  }

  if (url.endsWith('/estoque/relatorio-reposicao')) {
    return sendOk(MOCK_ESTOQUE_REPOSICAO);
  }

  // ─── 13. RELATÓRIOS & BI ───────────────────────────────────────────────────
  if (url.endsWith('/relatorios/dre')) {
    const inicio = getParam('dataInicio') || '2026-03-01';
    const fim = getParam('dataFim') || '2026-03-31';
    return sendOk(generateDre(inicio, fim));
  }

  if (url.endsWith('/relatorios/top-produtos')) {
    const inicio = getParam('dataInicio') || '2026-03-01';
    const fim = getParam('dataFim') || '2026-03-31';
    return sendOk(generateTopProdutos(inicio, fim));
  }

  if (url.endsWith('/relatorios/vendas-periodo')) {
    const inicio = getParam('dataInicio') || '2026-03-01';
    const fim = getParam('dataFim') || '2026-03-31';
    return sendOk(generateVendasPeriodo(inicio, fim));
  }

  if (url.endsWith('/relatorios/fluxo-caixa')) {
    const inicio = getParam('dataInicio') || '2026-03-01';
    const fim = getParam('dataFim') || '2026-03-31';
    return sendOk(generateFluxoCaixa(inicio, fim));
  }

  if (url.endsWith('/relatorios/dashboard-consolidado')) {
    const faturamentoMes = generateDre('', '').receitaBruta;
    const faturamentoHoje = 1450.00;
    const vendasHojeCount = 4;
    const ticketMedio = faturamentoHoje / (vendasHojeCount || 1);
    
    const dashboardData = {
      faturamentoHoje,
      vendasHojeCount,
      faturamentoMes,
      ticketMedio,
      orcamentosPendentes: dbOrcamentos.filter(o => o.status === 'PENDENTE').length,
      estoqueCritico: dbProdutos.filter(p => p.estoqueAtual <= p.estoqueMinimo).length,
      vendasDiarias: generateVendasPeriodo('2026-03-01', '2026-03-07'),
      topProdutos: generateTopProdutos('', '').produtos
    };
    return sendOk(dashboardData);
  }

  // ─── 14. LOGÍSTICA ─────────────────────────────────────────────────────────
  if (url.endsWith('/logistica/entregas')) {
    if (method === 'POST') {
      const body = req.body as any;
      const v = dbVendas.find(vda => vda.id === body.vendaId);
      const newEnt = {
        id: dbEntregasPendentes.length + 1,
        vendaId: body.vendaId,
        cargaId: null,
        status: 'PENDENTE',
        enderecoEntrega: body.enderecoEntrega,
        cidade: body.cidade,
        estado: body.estado || 'SP',
        cep: body.cep || '',
        observacoes: body.observacoes || null,
        venda: {
          numero: v ? v.numero : 'VND-MOCK',
          cliente: {
            nome: (v && v.cliente) ? v.cliente.nome : 'Consumidor Final'
          }
        }
      };
      dbEntregasPendentes.push(newEnt as any);
      return sendOk(newEnt);
    }
  }

  if (url.endsWith('/logistica/entregas/pendentes')) {
    return sendOk(dbEntregasPendentes);
  }

  if (url.endsWith('/logistica/cargas')) {
    if (method === 'GET') {
      return sendOk(dbCargas);
    }
    if (method === 'POST') {
      const body = req.body as any;
      const numStr = String(dbCargas.length + 1).padStart(4, '0');
      
      // Associa as entregas à nova carga
      const entregasAssociadas = dbEntregasPendentes.filter(e => body.entregaIds.includes(e.id));
      dbEntregasPendentes = dbEntregasPendentes.filter(e => !body.entregaIds.includes(e.id));

      const newCarga = {
        id: dbCargas.length + 1,
        numero: `CRG-2026-${numStr}`,
        motorista: body.motorista,
        placaVeiculo: body.placaVeiculo,
        status: 'EM_ROTA',
        dataSaida: new Date().toISOString(),
        observacoes: body.observacoes || null,
        entregas: entregasAssociadas.map(e => ({ ...e, status: 'EM_TRANSITO' })),
        romaneioCarregamento: 'Romaneio gerado automaticamente'
      };
      
      dbCargas.push(newCarga);
      return sendOk(newCarga);
    }
  }

  if (url.includes('/logistica/cargas/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    const index = dbCargas.findIndex(c => c.id === id);
    if (index !== -1) {
      if (url.endsWith('/status')) {
        const body = req.body as any;
        dbCargas[index].status = body.status;
        return sendOk(dbCargas[index]);
      }
      return sendOk(dbCargas[index]);
    }
    return sendError(404, 'Carga não encontrada');
  }

  if (url.includes('/logistica/entregas/')) {
    const id = parseInt(url.split('/').filter(p => !isNaN(Number(p))).pop() || '0', 10);
    if (url.endsWith('/status')) {
      const body = req.body as any;
      // Atualiza na carga correspondente
      dbCargas.forEach(c => {
        const ent = c.entregas?.find(e => e.id === id);
        if (ent) {
          ent.status = body.status;
        }
      });
      return sendOk({});
    }
  }

  // ─── 15. USUÁRIOS ──────────────────────────────────────────────────────────
  if (url.endsWith('/usuarios')) {
    if (method === 'GET') {
      const search = getSearch();
      let filtered = dbUsuarios;
      if (search) {
        filtered = dbUsuarios.filter(u => u.nome.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
      }
      const page = getPage();
      const limit = getLimit();
      return sendOk({
        data: paginate(filtered, page, limit),
        meta: { total: filtered.length, page, limit }
      });
    }
    if (method === 'POST') {
      const body = req.body as any;
      const newUser = {
        id: dbUsuarios.length + 1,
        nome: body.nome,
        email: body.email,
        role: body.role || 'VENDEDOR',
        ativo: true,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${body.nome.replace(/\s+/g, '')}`,
        empresaId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbUsuarios.push(newUser);
      return sendOk(newUser);
    }
  }

  if (url.endsWith('/usuarios/me')) {
    const user = dbUsuarios.find(u => u.id === 1) || dbUsuarios[0];
    return sendOk(user);
  }

  if (url.includes('/usuarios/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    if (method === 'GET') {
      const user = dbUsuarios.find(u => u.id === id);
      return user ? sendOk(user) : sendError(404, 'Usuário não encontrado');
    }
    if (method === 'PATCH') {
      const body = req.body as any;
      const index = dbUsuarios.findIndex(u => u.id === id);
      if (index !== -1) {
        dbUsuarios[index] = { ...dbUsuarios[index], ...body, updatedAt: new Date().toISOString() };
        return sendOk(dbUsuarios[index]);
      }
      return sendError(404, 'Usuário não encontrado');
    }
    if (method === 'DELETE') {
      dbUsuarios = dbUsuarios.filter(u => u.id !== id);
      return sendOk({});
    }
  }

  // ─── 16. EMPRESAS ──────────────────────────────────────────────────────────
  if (url.endsWith('/empresas')) {
    return sendOk({
      data: dbEmpresas,
      meta: { total: dbEmpresas.length, page: 1, limit: 20 }
    });
  }

  if (url.includes('/empresas/plano')) {
    // Simula alteração de assinatura da empresa na demo
    return sendOk({ success: true });
  }

  if (url.includes('/empresas/importar-categorias-construcao')) {
    // Popula categorias com padrão de material de construção
    return sendOk({ success: true });
  }

  if (url.includes('/empresas/')) {
    const id = parseInt(url.split('/').pop() || '0', 10);
    const emp = dbEmpresas.find(e => e.id === id) || dbEmpresas[0];
    return sendOk(emp);
  }

  // ─── 17. FIADOS ────────────────────────────────────────────────────────────
  if (url.includes('/fiados/resumo')) {
    const search = getSearch();
    let filtered = MOCK_FIADOS_RESUMO;
    if (search) {
      filtered = MOCK_FIADOS_RESUMO.filter(f => f.cliente.nome.toLowerCase().includes(search));
    }
    const page = getPage();
    const limit = getLimit();
    return sendOk({
      data: paginate(filtered, page, limit),
      meta: { total: filtered.length, page, limit }
    });
  }

  if (url.includes('/fiados/') && url.endsWith('/detalhes')) {
    const id = parseInt(url.split('/').filter(p => !isNaN(Number(p))).pop() || '0', 10);
    const detalhes = MOCK_FIADOS_DETALHES[id] || [];
    return sendOk(detalhes);
  }

  // Pass-through padrão (se alguma URL não mapeada passar por aqui, deixa prosseguir com o next original)
  return next(req);
};
