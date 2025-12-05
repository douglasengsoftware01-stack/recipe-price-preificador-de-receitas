import * as XLSX from 'xlsx';

export const generatePricingExcel = (reports, companyName) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // Dados para a planilha principal
  const mainData = [];
  
  // Cabeçalho
  mainData.push([
    'Receita',
    'Custo Ingredientes (R$)',
    'Custo Embalagem (R$)',
    'Rateio Despesas Fixas (R$)',
    'Taxas (R$)',
    'Comissões (R$)',
    'Outras Despesas (R$)',
    'Custo Total (R$)',
    'Lucro Desejado (R$)',
    'Preço Sugerido (R$)',
    'Margem de Lucro (%)',
    'Tempo Preparo (min)'
  ]);
  
  // Dados das receitas
  reports.forEach(report => {
    const { recipe, calculation, preparationTime } = report;
    const totalCost = calculation.suggestedPrice - calculation.desiredProfit;
    const marginPercent = ((calculation.desiredProfit / calculation.suggestedPrice) * 100).toFixed(1);
    
    mainData.push([
      recipe.name,
      calculation.ingredientCosts.toFixed(2),
      calculation.packagingCost.toFixed(2),
      calculation.fixedExpenseAllocation.toFixed(2),
      calculation.variableExpenses.taxes.toFixed(2),
      calculation.variableExpenses.commissions.toFixed(2),
      calculation.variableExpenses.others.toFixed(2),
      totalCost.toFixed(2),
      calculation.desiredProfit.toFixed(2),
      calculation.suggestedPrice.toFixed(2),
      marginPercent,
      preparationTime
    ]);
  });
  
  // Criar planilha principal
  const ws = XLSX.utils.aoa_to_sheet(mainData);
  
  // Definir larguras das colunas
  const colWidths = [
    { wch: 20 }, // Receita
    { wch: 15 }, // Custo Ingredientes
    { wch: 15 }, // Custo Embalagem
    { wch: 18 }, // Rateio Despesas
    { wch: 12 }, // Taxas
    { wch: 12 }, // Comissões
    { wch: 15 }, // Outras Despesas
    { wch: 15 }, // Custo Total
    { wch: 15 }, // Lucro Desejado
    { wch: 15 }, // Preço Sugerido
    { wch: 15 }, // Margem Lucro
    { wch: 15 }  // Tempo Preparo
  ];
  ws['!cols'] = colWidths;
  
  // Adicionar planilha ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Precificação');
  
  // Criar planilha de detalhes dos ingredientes
  const ingredientsData = [];
  ingredientsData.push(['Receita', 'Ingrediente', 'Quantidade', 'Unidade', 'Custo Unitário (R$)', 'Custo Total (R$)']);
  
  reports.forEach(report => {
    const { recipe } = report;
    recipe.ingredients.forEach(ri => {
      const totalCost = ri.ingredient.costPerUnit * ri.quantity;
      ingredientsData.push([
        recipe.name,
        ri.ingredient.name,
        ri.quantity,
        ri.ingredient.unit,
        ri.ingredient.costPerUnit.toFixed(2),
        totalCost.toFixed(2)
      ]);
    });
  });
  
  const wsIngredients = XLSX.utils.aoa_to_sheet(ingredientsData);
  wsIngredients['!cols'] = [
    { wch: 20 }, // Receita
    { wch: 20 }, // Ingrediente
    { wch: 12 }, // Quantidade
    { wch: 12 }, // Unidade
    { wch: 15 }, // Custo Unitário
    { wch: 15 }  // Custo Total
  ];
  
  XLSX.utils.book_append_sheet(wb, wsIngredients, 'Ingredientes');
  
  // Criar planilha de resumo
  const summaryData = [];
  summaryData.push(['Relatório de Precificação']);
  summaryData.push([]);
  
  if (companyName) {
    summaryData.push(['Empresa:', companyName]);
  }
  
  summaryData.push(['Data de Geração:', new Date().toLocaleDateString('pt-BR')]);
  summaryData.push(['Total de Receitas:', reports.length]);
  summaryData.push([]);
  
  // Estatísticas
  const totalSuggestedPrice = reports.reduce((sum, r) => sum + r.calculation.suggestedPrice, 0);
  const totalCost = reports.reduce((sum, r) => sum + (r.calculation.suggestedPrice - r.calculation.desiredProfit), 0);
  const totalProfit = reports.reduce((sum, r) => sum + r.calculation.desiredProfit, 0);
  const avgMargin = reports.length > 0 ? (totalProfit / totalSuggestedPrice * 100) : 0;
  
  summaryData.push(['Estatísticas Gerais:']);
  summaryData.push(['Preço Total Sugerido (R$):', totalSuggestedPrice.toFixed(2)]);
  summaryData.push(['Custo Total (R$):', totalCost.toFixed(2)]);
  summaryData.push(['Lucro Total (R$):', totalProfit.toFixed(2)]);
  summaryData.push(['Margem Média (%):', avgMargin.toFixed(1)]);
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');
  
  // Gerar e baixar arquivo
  const fileName = `precificacao-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const generateRecipeExcel = (recipes, companyName) => {
  const wb = XLSX.utils.book_new();
  
  // Dados principais das receitas
  const mainData = [];
  mainData.push([
    'Nome da Receita',
    'Número de Ingredientes',
    'Custo dos Ingredientes (R$)',
    'Custo da Embalagem (R$)',
    'Custo Total (R$)',
    'Data de Criação'
  ]);
  
  recipes.forEach(recipe => {
    const ingredientsCost = recipe.recipe_ingredients?.reduce((total, ri) => {
      return total + (parseFloat(ri.quantity) * parseFloat(ri.ingredients.cost_per_unit));
    }, 0) || 0;
    
    const packagingCost = recipe.recipe_packaging?.[0]?.packagings?.unit_cost ? 
      parseFloat(recipe.recipe_packaging[0].packagings.unit_cost) : 0;
    
    const totalCost = ingredientsCost + packagingCost;
    
    mainData.push([
      recipe.name,
      recipe.recipe_ingredients?.length || 0,
      ingredientsCost.toFixed(2),
      packagingCost.toFixed(2),
      totalCost.toFixed(2),
      new Date(recipe.created_at).toLocaleDateString('pt-BR')
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(mainData);
  ws['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 15 }, // Num Ingredientes
    { wch: 18 }, // Custo Ingredientes
    { wch: 18 }, // Custo Embalagem
    { wch: 15 }, // Custo Total
    { wch: 15 }  // Data
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
  
  // Detalhes dos ingredientes
  const ingredientsData = [];
  ingredientsData.push(['Receita', 'Ingrediente', 'Quantidade', 'Unidade', 'Custo por Unidade (R$)', 'Custo Total (R$)']);
  
  recipes.forEach(recipe => {
    recipe.recipe_ingredients?.forEach(ri => {
      const totalCost = parseFloat(ri.quantity) * parseFloat(ri.ingredients.cost_per_unit);
      ingredientsData.push([
        recipe.name,
        ri.ingredients.name,
        ri.quantity,
        ri.ingredients.unit,
        parseFloat(ri.ingredients.cost_per_unit).toFixed(2),
        totalCost.toFixed(2)
      ]);
    });
  });
  
  const wsIngredients = XLSX.utils.aoa_to_sheet(ingredientsData);
  wsIngredients['!cols'] = [
    { wch: 20 }, // Receita
    { wch: 20 }, // Ingrediente
    { wch: 12 }, // Quantidade
    { wch: 12 }, // Unidade
    { wch: 18 }, // Custo Unitário
    { wch: 15 }  // Custo Total
  ];
  
  XLSX.utils.book_append_sheet(wb, wsIngredients, 'Detalhes Ingredientes');
  
  // Resumo
  const summaryData = [];
  summaryData.push(['Relatório de Receitas']);
  summaryData.push([]);
  
  if (companyName) {
    summaryData.push(['Empresa:', companyName]);
  }
  
  summaryData.push(['Data de Geração:', new Date().toLocaleDateString('pt-BR')]);
  summaryData.push(['Total de Receitas:', recipes.length]);
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');
  
  const fileName = `receitas-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};