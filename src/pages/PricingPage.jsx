import React, { useState } from 'react';
import styled from 'styled-components';
import { Calculator, ChefHat, Package, DollarSign, TrendingUp, ShoppingCart, Clock, Percent, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generatePricingReport } from '../utils/pdfGenerator';
import { generatePricingExcel } from '../utils/excelGenerator';
import { colors, Container } from '../styles/GlobalStyles';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray[900]};
    margin-bottom: 4px;
  }
  
  p {
    color: ${colors.gray[600]};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background: ${colors.white};
  font-size: 16px;
  color: ${colors.gray[900]};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[500]}20;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.gray[700]};
  margin-bottom: 8px;
`;

const VariableExpensesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PriceResultCard = styled(Card)`
  background: linear-gradient(to right, ${colors.secondary[50]}, ${colors.secondary[100]});
  border: 1px solid ${colors.secondary[200]};
  text-align: center;
`;

const PriceIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const PriceValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${colors.secondary[900]};
  margin-bottom: 8px;
`;

const PriceLabel = styled.p`
  color: ${colors.secondary[700]};
`;

const CostBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CostRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${colors.gray[100]};
  
  &:last-child {
    border-bottom: 2px solid ${colors.gray[200]};
    font-weight: bold;
  }
  
  span:first-child {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
  
  span:last-child {
    font-weight: 500;
    color: ${colors.gray[900]};
  }
`;

const ProfitRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  
  span:first-child {
    font-size: 14px;
    color: ${colors.secondary[600]};
  }
  
  span:last-child {
    font-weight: bold;
    color: ${colors.secondary[600]};
  }
`;

const RecipeDetailsCard = styled(Card)`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 16px;
  }
`;

const RecipeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const RecipeIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecipeInfo = styled.div`
  h4 {
    font-weight: 600;
    color: ${colors.gray[900]};
  }
  
  p {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
`;

const IngredientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IngredientRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${colors.gray[50]};
  border-radius: 8px;
  
  .ingredient-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      font-size: 14px;
      color: ${colors.gray[900]};
    }
  }
  
  .ingredient-cost {
    font-size: 14px;
    font-weight: 500;
    color: ${colors.gray[700]};
  }
`;

const PackagingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${colors.blue[50]};
  border-radius: 8px;
  
  .packaging-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      font-size: 14px;
      color: ${colors.blue[900]};
    }
  }
  
  .packaging-cost {
    font-size: 14px;
    font-weight: 500;
    color: ${colors.blue[700]};
  }
`;

const AdditionalInfoCard = styled(Card)`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 16px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  span:first-child {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
  
  span:last-child {
    font-weight: 500;
    color: ${colors.gray[900]};
  }
`;

const ReportCard = styled(Card)`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 8px;
  }
  
  p {
    color: ${colors.gray[600]};
    margin-bottom: 16px;
  }
`;

const ReportButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyStateCard = styled(Card)`
  text-align: center;
  padding: 48px 24px;
  
  svg {
    margin: 0 auto 16px;
    color: ${colors.gray[300]};
  }
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    color: ${colors.gray[900]};
    margin-bottom: 8px;
  }
  
  p {
    color: ${colors.gray[600]};
  }
`;

const LoadingContainer = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  
  .loading-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  }
  
  p {
    color: ${colors.gray[600]};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const WarningCard = styled(Card)`
  background: ${colors.yellow[50]};
  border: 1px solid ${colors.yellow[200]};
  
  .warning-content {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .warning-icon {
      width: 40px;
      height: 40px;
      background: ${colors.yellow[500]};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .warning-text {
      h3 {
        font-weight: 500;
        color: ${colors.yellow[900]};
        margin-bottom: 4px;
      }
      
      p {
        font-size: 14px;
        color: ${colors.yellow[700]};
      }
    }
  }
`;

export const PricingPage = () => {
  const { profile } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(30);
  const [taxesPercent, setTaxesPercent] = useState(8);
  const [commissionsPercent, setCommissionsPercent] = useState(5);
  const [othersPercent, setOthersPercent] = useState(2);
  const [desiredProfitPercent, setDesiredProfitPercent] = useState(30);
  const [calculation, setCalculation] = useState(null);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  // Load data from Supabase
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Para usuário demo, usar dados do localStorage
      const user = JSON.parse(localStorage.getItem('demo-user') || '{}');
      if (user.id === 'demo-user-id') {
        const storedRecipes = JSON.parse(localStorage.getItem('demo-recipes') || '[]');
        const storedExpenses = JSON.parse(localStorage.getItem('demo-expenses') || '[]');
        
        setRecipes(storedRecipes);
        setFixedExpenses(storedExpenses);
        setLoading(false);
        return;
      }

      // Load recipes with ingredients and packaging
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            quantity,
            ingredients (*)
          ),
          recipe_packaging (
            packagings (*)
          )
        `);

      if (recipesError) throw recipesError;

      // Transform data to match our Recipe interface
      const transformedRecipes = recipesData?.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.image_url,
        ingredients: recipe.recipe_ingredients.map((ri) => ({
          id: ri.ingredients.id,
          ingredient: ri.ingredients,
          quantity: ri.quantity
        })),
        packaging: recipe.recipe_packaging[0]?.packagings || undefined,
        createdAt: recipe.created_at,
        userId: recipe.user_id
      })) || [];

      setRecipes(transformedRecipes);

      // Load fixed expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('fixed_expenses')
        .select('*');

      if (expensesError) throw expensesError;

      const transformedExpenses = expensesData?.map(expense => ({
        id: expense.id,
        name: expense.name,
        monthlyValue: expense.monthly_value,
        createdAt: expense.created_at,
        userId: expense.user_id
      })) || [];

      setFixedExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!selectedRecipe || !profile?.monthly_working_hours) return;

    // Custo dos ingredientes
    const ingredientCosts = selectedRecipe.recipe_ingredients?.reduce((total, ri) => {
      return total + (ri.ingredients.cost_per_unit * ri.quantity);
    }, 0) || 0;

    // Custo da embalagem
    const packagingCost = selectedRecipe.recipe_packaging?.[0]?.packagings?.unit_cost || 0;

    // Total de despesas fixas mensais
    const totalFixedExpenses = fixedExpenses.reduce((total, expense) => 
      total + expense.monthly_value, 0
    );

    // Rateio das despesas fixas baseado no tempo
    const costPerHour = totalFixedExpenses / profile.monthly_working_hours;
    const preparationHours = preparationTimeMinutes / 60;
    const fixedExpenseAllocation = costPerHour * preparationHours;

    // Custo base (ingredientes + embalagem + rateio)
    const baseCost = ingredientCosts + packagingCost + fixedExpenseAllocation;

    // Despesas variáveis
    const taxes = baseCost * (taxesPercent / 100);
    const commissions = baseCost * (commissionsPercent / 100);
    const others = baseCost * (othersPercent / 100);
    const totalVariableExpenses = taxes + commissions + others;

    // Custo total
    const totalCost = baseCost + totalVariableExpenses;

    // Lucro desejado
    const desiredProfit = totalCost * (desiredProfitPercent / 100);

    // Preço de venda sugerido
    const suggestedPrice = totalCost + desiredProfit;

    const calc = {
      ingredientCosts,
      packagingCost,
      fixedExpenseAllocation,
      variableExpenses: {
        taxes,
        commissions,
        others,
        total: totalVariableExpenses
      },
      desiredProfit,
      suggestedPrice
    };

    setCalculation(calc);
  };

  const resetCalculation = () => {
    setCalculation(null);
    setSelectedRecipeId('');
  };

  const generateReport = () => {
    if (!calculation || !selectedRecipe) return;

    const report = {
      recipe: selectedRecipe,
      calculation,
      preparationTime: preparationTimeMinutes,
      taxesPercent,
      commissionsPercent,
      othersPercent,
      desiredProfitPercent
    };

    generatePricingReport([report], profile?.company_name);
  };

  const generateExcelReport = () => {
    if (!calculation || !selectedRecipe) return;

    const report = {
      recipe: selectedRecipe,
      calculation,
      preparationTime: preparationTimeMinutes,
      taxesPercent,
      commissionsPercent,
      othersPercent,
      desiredProfitPercent
    };

    generatePricingExcel([report], profile?.company_name);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div className="loading-icon">
          <Calculator size={32} color={colors.white} />
        </div>
        <p>Carregando dados...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Calculadora de Preços</h1>
          <p>Calcule o preço ideal para suas receitas considerando todos os custos</p>
        </HeaderContent>
      </Header>

      {/* Settings Warning */}
      {!profile?.monthly_working_hours && (
        <WarningCard>
          <div className="warning-content">
            <div className="warning-icon">
              <Clock size={20} color={colors.white} />
            </div>
            <div className="warning-text">
              <h3>Configuração Necessária</h3>
              <p>
                Configure as horas de funcionamento da empresa nas Configurações para usar o rateio por tempo.
              </p>
            </div>
          </div>
        </WarningCard>
      )}

      <Grid>
        {/* Form Section */}
        <FormSection>
          <Card>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.gray[900], marginBottom: '24px' }}>
              Parâmetros de Precificação
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Recipe Selection */}
              <div>
                <Label>Selecionar Receita</Label>
                <Select
                  value={selectedRecipeId}
                  onChange={(e) => {
                    setSelectedRecipeId(e.target.value);
                    setCalculation(null);
                  }}
                >
                  <option value="">Escolha uma receita</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                  ))}
                </Select>
              </div>

              {/* Preparation Time */}
              <Input
                label="Tempo de Preparo"
                type="number"
                min="1"
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(parseInt(e.target.value) || 30)}
                placeholder="30"
                leftIcon={<Clock size={20} color={colors.gray[400]} />}
                rightIcon={<span style={{ color: colors.gray[500], fontSize: '14px' }}>min</span>}
              />

              {/* Variable Expenses */}
              <div>
                <Label style={{ marginBottom: '16px' }}>Despesas Variáveis (%)</Label>
                <VariableExpensesGrid>
                  <Input
                    label="Taxas"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxesPercent}
                    onChange={(e) => setTaxesPercent(parseFloat(e.target.value) || 0)}
                    placeholder="8"
                    leftIcon={<Percent size={16} color={colors.gray[400]} />}
                  />
                  <Input
                    label="Comissões"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commissionsPercent}
                    onChange={(e) => setCommissionsPercent(parseFloat(e.target.value) || 0)}
                    placeholder="5"
                    leftIcon={<Percent size={16} color={colors.gray[400]} />}
                  />
                  <Input
                    label="Outras"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={othersPercent}
                    onChange={(e) => setOthersPercent(parseFloat(e.target.value) || 0)}
                    placeholder="2"
                    leftIcon={<Percent size={16} color={colors.gray[400]} />}
                  />
                </VariableExpensesGrid>
                <div style={{ marginTop: '8px', fontSize: '14px', color: colors.gray[600] }}>
                  Total: {(taxesPercent + commissionsPercent + othersPercent).toFixed(1)}%
                </div>
              </div>

              {/* Desired Profit */}
              <Input
                label="Lucro Desejado (%)"
                type="number"
                step="0.1"
                min="0"
                value={desiredProfitPercent}
                onChange={(e) => setDesiredProfitPercent(parseFloat(e.target.value) || 0)}
                placeholder="30"
                leftIcon={<Percent size={20} color={colors.gray[400]} />}
              />

              <div style={{ display: 'flex', gap: '16px' }}>
                <Button 
                  onClick={calculatePricing}
                  disabled={!selectedRecipeId || !profile?.monthly_working_hours}
                  style={{ flex: 1 }}
                >
                  <Calculator size={16} style={{ marginRight: '8px' }} />
                  Calcular Preço
                </Button>
                <Button 
                  onClick={resetCalculation}
                  variant="ghost"
                  style={{ flex: 1 }}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </Card>

          {/* Recipe Details */}
          {selectedRecipe && (
            <RecipeDetailsCard>
              <h3>Detalhes da Receita</h3>
              
              <RecipeHeader>
                <RecipeIcon>
                  <ChefHat size={24} color={colors.white} />
                </RecipeIcon>
                <RecipeInfo>
                  <h4>{selectedRecipe.name}</h4>
                  <p>{selectedRecipe.recipe_ingredients?.length || 0} ingredientes</p>
                </RecipeInfo>
              </RecipeHeader>

              {/* Ingredients List */}
              {selectedRecipe.recipe_ingredients && selectedRecipe.recipe_ingredients.length > 0 && (
                <div>
                  <h5 style={{ fontWeight: '500', color: colors.gray[900], marginBottom: '12px' }}>
                    Ingredientes:
                  </h5>
                  <IngredientsList>
                    {selectedRecipe.recipe_ingredients.map((ri) => (
                      <IngredientRow key={ri.ingredients.id}>
                        <div className="ingredient-info">
                          <ShoppingCart size={16} color={colors.gray[500]} />
                          <span>
                            {ri.ingredients.name} ({ri.quantity} {ri.ingredients.unit})
                          </span>
                        </div>
                        <span className="ingredient-cost">
                          R$ {(ri.ingredients.cost_per_unit * ri.quantity).toFixed(2)}
                        </span>
                      </IngredientRow>
                    ))}
                  </IngredientsList>
                </div>
              )}

              {/* Packaging */}
              {selectedRecipe.recipe_packaging && selectedRecipe.recipe_packaging[0] && (
                <div style={{ marginTop: '16px' }}>
                  <PackagingRow>
                    <div className="packaging-info">
                      <Package size={16} color={colors.blue[600]} />
                      <span>{selectedRecipe.recipe_packaging[0].packagings.name}</span>
                    </div>
                    <span className="packaging-cost">
                      R$ {selectedRecipe.recipe_packaging[0].packagings.unit_cost.toFixed(2)}
                    </span>
                  </PackagingRow>
                </div>
              )}
            </RecipeDetailsCard>
          )}
        </FormSection>

        {/* Results Section */}
        <ResultsSection>
          {calculation ? (
            <>
              {/* Price Result */}
              <PriceResultCard>
                <PriceIcon>
                  <TrendingUp size={32} color={colors.white} />
                </PriceIcon>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.secondary[900], marginBottom: '8px' }}>
                  Preço Sugerido
                </h3>
                <PriceValue>
                  R$ {calculation.suggestedPrice.toFixed(2)}
                </PriceValue>
                <PriceLabel>Por unidade</PriceLabel>
              </PriceResultCard>

              {/* Cost Breakdown */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.gray[900], marginBottom: '16px' }}>
                  Composição de Custos
                </h3>
                
                <CostBreakdown>
                  <CostRow>
                    <span>Ingredientes:</span>
                    <span>R$ {calculation.ingredientCosts.toFixed(2)}</span>
                  </CostRow>

                  <CostRow>
                    <span>Embalagem:</span>
                    <span>R$ {calculation.packagingCost.toFixed(2)}</span>
                  </CostRow>

                  <CostRow>
                    <span>Rateio Despesas Fixas:</span>
                    <span>R$ {calculation.fixedExpenseAllocation.toFixed(2)}</span>
                  </CostRow>

                  <CostRow>
                    <span>Taxas ({taxesPercent}%):</span>
                    <span>R$ {calculation.variableExpenses.taxes.toFixed(2)}</span>
                  </CostRow>
                  
                  <CostRow>
                    <span>Comissões ({commissionsPercent}%):</span>
                    <span>R$ {calculation.variableExpenses.commissions.toFixed(2)}</span>
                  </CostRow>
                  
                  <CostRow>
                    <span>Outras ({othersPercent}%):</span>
                    <span>R$ {calculation.variableExpenses.others.toFixed(2)}</span>
                  </CostRow>

                  <CostRow>
                    <span>Custo Total:</span>
                    <span>R$ {(calculation.suggestedPrice - calculation.desiredProfit).toFixed(2)}</span>
                  </CostRow>

                  <ProfitRow>
                    <span>Lucro ({desiredProfitPercent}%):</span>
                    <span>R$ {calculation.desiredProfit.toFixed(2)}</span>
                  </ProfitRow>
                </CostBreakdown>
              </Card>

              {/* Additional Info */}
              <AdditionalInfoCard>
                <h3>Informações Adicionais</h3>
                
                <InfoRow>
                  <span>Margem de lucro:</span>
                  <span>
                    {((calculation.desiredProfit / calculation.suggestedPrice) * 100).toFixed(1)}%
                  </span>
                </InfoRow>
                
                <InfoRow>
                  <span>Tempo de preparo:</span>
                  <span>{preparationTimeMinutes} minutos</span>
                </InfoRow>

                <InfoRow>
                  <span>Custo por hora (despesas fixas):</span>
                  <span>
                    R$ {profile?.monthly_working_hours ? 
                      (fixedExpenses.reduce((total, expense) => total + expense.monthly_value, 0) / profile.monthly_working_hours).toFixed(2) : 
                      '0,00'
                    }
                  </span>
                </InfoRow>
              </AdditionalInfoCard>

              {/* Generate Report Button */}
              <ReportCard>
                <h3>Relatório</h3>
                <p>
                  Gere um relatório completo com todos os detalhes da precificação desta receita.
                </p>
                <ReportButtons>
                  <Button onClick={generateReport} variant="secondary">
                    <FileText size={16} style={{ marginRight: '8px' }} />
                    Gerar Relatório PDF
                  </Button>
                  <Button onClick={generateExcelReport} variant="ghost">
                    <FileText size={16} style={{ marginRight: '8px' }} />
                    Gerar Relatório Excel
                  </Button>
                </ReportButtons>
              </ReportCard>
            </>
          ) : (
            <EmptyStateCard>
              <Calculator size={64} />
              <h3>Calcule o Preço</h3>
              <p>
                Selecione uma receita e configure os parâmetros para calcular o preço ideal
              </p>
            </EmptyStateCard>
          )}
        </ResultsSection>
      </Grid>
    </Container>
  );
};