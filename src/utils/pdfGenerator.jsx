import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePricingReport = (reports, companyName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(255, 165, 0); // Orange
  doc.text('Relatório de Precificação', 20, 20);
  
  if (companyName) {
    doc.setFontSize(12);
    doc.setTextColor(128, 128, 128); // Gray
    doc.text(companyName, 20, 30);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
  
  let yPosition = 60;
  
  reports.forEach((report, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    const { recipe, calculation, preparationTime, desiredProfitPercent } = report;
    
    // Recipe title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${recipe.name}`, 20, yPosition);
    yPosition += 10;
    
    // Recipe image placeholder
    if (recipe.imageUrl) {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Imagem: ' + recipe.imageUrl, 20, yPosition);
      yPosition += 8;
    }
    
    // Ingredients table
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Ingredientes:', 20, yPosition);
    yPosition += 8;
    
    const ingredientsData = recipe.ingredients.map(ri => [
      ri.ingredient.name,
      `${ri.quantity} ${ri.ingredient.unit}`,
      `R$ ${(ri.ingredient.costPerUnit * ri.quantity).toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Ingrediente', 'Quantidade', 'Custo']],
      body: ingredientsData,
      theme: 'grid',
      headStyles: { fillColor: [255, 165, 0] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
    
    // Cost breakdown
    doc.setFontSize(12);
    doc.text('Composição de Custos:', 20, yPosition);
    yPosition += 8;
    
    const costData = [
      ['Ingredientes', `R$ ${calculation.ingredientCosts.toFixed(2)}`],
      ['Embalagem', `R$ ${calculation.packagingCost.toFixed(2)}`],
      ['Rateio Despesas Fixas', `R$ ${calculation.fixedExpenseAllocation.toFixed(2)}`],
      ['Taxas', `R$ ${calculation.variableExpenses.taxes.toFixed(2)}`],
      ['Comissões', `R$ ${calculation.variableExpenses.commissions.toFixed(2)}`],
      ['Outras Despesas', `R$ ${calculation.variableExpenses.others.toFixed(2)}`],
      ['Custo Total', `R$ ${(calculation.suggestedPrice - calculation.desiredProfit).toFixed(2)}`],
      [`Lucro (${desiredProfitPercent}%)`, `R$ ${calculation.desiredProfit.toFixed(2)}`]
    ];
    
    doc.autoTable({
      startY: yPosition,
      body: costData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
    
    // Final price
    doc.setFontSize(14);
    doc.setTextColor(144, 238, 144); // Light green
    doc.text(`Preço de Venda Sugerido: R$ ${calculation.suggestedPrice.toFixed(2)}`, 20, yPosition);
    
    // Additional info
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Tempo de preparo: ${preparationTime} minutos`, 20, yPosition);
    yPosition += 6;
    doc.text(`Margem de lucro: ${((calculation.desiredProfit / calculation.suggestedPrice) * 100).toFixed(1)}%`, 20, yPosition);
    yPosition += 6;
    doc.text(`Lucro por unidade: R$ ${calculation.desiredProfit.toFixed(2)}`, 20, yPosition);
    
    yPosition += 20;
  });
  
  // Save the PDF
  doc.save(`relatorio-precificacao-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateRecipeReport = (recipes, companyName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(255, 165, 0); // Orange
  doc.text('Relatório de Receitas', 20, 20);
  
  if (companyName) {
    doc.setFontSize(12);
    doc.setTextColor(128, 128, 128); // Gray
    doc.text(companyName, 20, 30);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
  
  let yPosition = 60;
  
  recipes.forEach((recipe, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Recipe title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${recipe.name}`, 20, yPosition);
    yPosition += 10;
    
    // Recipe image
    if (recipe.image_url) {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Imagem: ' + recipe.image_url, 20, yPosition);
      yPosition += 8;
    }
    
    // Ingredients
    if (recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Ingredientes:', 20, yPosition);
      yPosition += 8;
      
      const ingredientsData = recipe.recipe_ingredients.map(ri => {
        const ingredient = ri.ingredients;
        const cost = (parseFloat(ri.quantity) * parseFloat(ingredient.cost_per_unit)).toFixed(2);
        return [
          ingredient.name,
          `${ri.quantity} ${ingredient.unit}`,
          `R$ ${cost}`
        ];
      });
      
      doc.autoTable({
        startY: yPosition,
        head: [['Ingrediente', 'Quantidade', 'Custo']],
        body: ingredientsData,
        theme: 'grid',
        headStyles: { fillColor: [255, 165, 0] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    // Packaging
    if (recipe.recipe_packaging && recipe.recipe_packaging.length > 0) {
      const packaging = recipe.recipe_packaging[0].packagings;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Embalagem: ${packaging.name} - R$ ${parseFloat(packaging.unit_cost).toFixed(2)}`, 20, yPosition);
      yPosition += 8;
    }
    
    // Total cost calculation
    const ingredientsCost = recipe.recipe_ingredients?.reduce((total, ri) => {
      return total + (parseFloat(ri.quantity) * parseFloat(ri.ingredients.cost_per_unit));
    }, 0) || 0;
    
    const packagingCost = recipe.recipe_packaging?.[0]?.packagings?.unit_cost ? 
      parseFloat(recipe.recipe_packaging[0].packagings.unit_cost) : 0;
    
    const totalCost = ingredientsCost + packagingCost;
    
    doc.setFontSize(12);
    doc.setTextColor(255, 165, 0);
    doc.text(`Custo Total: R$ ${totalCost.toFixed(2)}`, 20, yPosition);
    
    yPosition += 20;
  });
  
  // Save the PDF
  doc.save(`relatorio-receitas-${new Date().toISOString().split('T')[0]}.pdf`);
};