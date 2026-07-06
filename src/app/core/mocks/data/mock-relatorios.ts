export function generateDre(dataInicio: string, dataFim: string) {
  return {
    receitaBruta: 19850.00,
    descontosConcedidos: 597.80,
    freteRecebido: 200.00,
    receitaLiquida: 19452.20,
    totalCmv: 8250.00,
    lucroBruto: 11202.20,
    despesasOperacionais: 4000.00,
    lucroLiquido: 7202.20,
    indicadores: {
      margemLucroBruto: 57.6,
      margemLucroLiquido: 37.0
    },
    despesasBreakdown: [
      { descricao: 'Energia Elétrica (Enel)', valor: 450.00 },
      { descricao: 'Aluguel do Galpão', valor: 2500.00 },
      { descricao: 'Taxas de Cartão & Impostos', valor: 650.00 },
      { descricao: 'Marketing Local & Anúncios', valor: 400.00 }
    ]
  };
}

export function generateTopProdutos(dataInicio: string, dataFim: string) {
  return {
    totalFaturamentoPeriodo: 19850.00,
    produtos: [
      {
        produtoId: 1,
        nome: 'Cimento Votoran CP-II 50kg',
        sku: 'MAT-CIM-VOT-50',
        quantidade: 150,
        faturamento: 5535.00,
        participacaoPercentual: 27.9
      },
      {
        produtoId: 8,
        nome: 'Porcelanato Portobello 60x60cm Munari Cimento',
        sku: 'PIS-POR-PTB-60',
        quantidade: 45,
        faturamento: 3595.50,
        participacaoPercentual: 18.1
      },
      {
        produtoId: 4,
        nome: 'Furadeira e Parafusadeira Bosch 12V',
        sku: 'FER-FUR-BOS-12V',
        quantidade: 8,
        faturamento: 3352.00,
        participacaoPercentual: 16.9
      },
      {
        produtoId: 2,
        nome: 'Tijolo Baianinho 8 Furos 9x19x19cm',
        sku: 'MAT-TIJ-8F-1000',
        quantidade: 3,
        faturamento: 2670.00,
        participacaoPercentual: 13.5
      },
      {
        produtoId: 12,
        nome: 'Chuveiro Lorenzetti Acqua Ultra',
        sku: 'LOU-CHU-LOR-ACQUA',
        quantidade: 6,
        faturamento: 2099.40,
        participacaoPercentual: 10.6
      }
    ]
  };
}

export function generateVendasPeriodo(dataInicioStr: string, dataFimStr: string) {
  const inicio = new Date(dataInicioStr);
  const fim = new Date(dataFimStr);
  const result = [];
  
  // Limitar a no máximo 31 dias para não sobrecarregar
  let current = new Date(inicio);
  while (current <= fim) {
    const dataStr = current.toISOString().split('T')[0];
    
    // Gerar um valor pseudo-aleatório baseado no dia do mês para consistência
    const day = current.getDate();
    const dayOfWeek = current.getDay();
    
    // Fins de semana vendem menos
    let valor = 300 + (day * 17) + (dayOfWeek * 50);
    let quantidade = 1 + (day % 3) + (dayOfWeek % 2);
    
    if (dayOfWeek === 0) { // Domingo fechado ou poucas vendas
      valor = valor * 0.1;
      quantidade = day % 2;
    }
    
    result.push({
      data: dataStr,
      valor: parseFloat(valor.toFixed(2)),
      quantidade
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}

export function generateFluxoCaixa(dataInicioStr: string, dataFimStr: string) {
  const inicio = new Date(dataInicioStr);
  const fim = new Date(dataFimStr);
  const result = [];
  
  let current = new Date(inicio);
  while (current <= fim) {
    const dataStr = current.toISOString().split('T')[0];
    
    const day = current.getDate();
    const dayOfWeek = current.getDay();
    
    let receitas = 350 + (day * 22) + (dayOfWeek * 60);
    // Despesas concentradas no início do mês (dia 5 e dia 10)
    let despesas = 0;
    if (day === 5) {
      despesas = 2500; // Aluguel
    } else if (day === 10) {
      despesas = 1000; // Salários / contas
    } else if (day % 4 === 0) {
      despesas = 150 + (day * 5); // Despesas gerais recorrentes
    }
    
    if (dayOfWeek === 0) {
      receitas = receitas * 0.1;
    }
    
    result.push({
      data: dataStr,
      receitas: parseFloat(receitas.toFixed(2)),
      despesas: parseFloat(despesas.toFixed(2))
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}
