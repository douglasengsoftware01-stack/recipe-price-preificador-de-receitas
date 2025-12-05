import React from 'react';
import styled from 'styled-components';
import { ChefHat, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, Container, Grid, LoadingContainer } from '../styles/GlobalStyles';

const WelcomeCard = styled(Card)`
  background: linear-gradient(to right, ${colors.primary[50]}, ${colors.secondary[50]});
  border: 1px solid ${colors.primary[200]};
`;

const WelcomeContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WelcomeIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WelcomeText = styled.div`
  h2 {
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray[900]};
  }
  
  p {
    color: ${colors.gray[600]};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(Card)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: ${colors.primary[200]};
  }
`;

const StatContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatInfo = styled.div`
  p {
    font-size: 14px;
    color: ${colors.gray[600]};
    font-weight: 500;
  }
  
  .value {
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray[900]};
    margin: 4px 0;
  }
  
  .change {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    
    span {
      font-size: 14px;
      color: ${colors.green[600]};
      font-weight: 500;
    }
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.gradient};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartCard = styled(Card)`
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: ${colors.gray[900]};
    }
    
    button {
      font-size: 14px;
      color: ${colors.primary[600]};
      background: none;
      border: none;
      font-weight: 500;
      cursor: pointer;
      
      &:hover {
        color: ${colors.primary[700]};
      }
    }
  }
  
  .chart-container {
    height: 256px;
  }
  
  .empty-chart {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${colors.gray[500]};
  }
`;

const SummaryCard = styled(Card)`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 24px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.bg};
  
  svg {
    margin: 0 auto 8px;
    color: ${props => props.iconColor};
  }
  
  .value {
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.valueColor};
  }
  
  .label {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
`;

export const DashboardPage = () => {
  const { profile } = useAuth();
  const [stats, setStats] = React.useState({
    recipes: 0,
    ingredients: 0,
    packagings: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [costData, setCostData] = React.useState([]);
  const [expenseData, setExpenseData] = React.useState([]);

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Para usuário demo, usar dados do localStorage
      if (user?.id === 'demo-user-id') {
        const storedRecipes = JSON.parse(localStorage.getItem('demo-recipes') || '[]');
        const storedIngredients = JSON.parse(localStorage.getItem('demo-ingredients') || '[]');
        const storedPackagings = JSON.parse(localStorage.getItem('demo-packagings') || '[]');
        const storedExpenses = JSON.parse(localStorage.getItem('demo-expenses') || '[]');
        
        const totalExpenses = storedExpenses.reduce((sum, exp) => sum + Number(exp.monthly_value || exp.unit_cost || 0), 0);
        
        setStats({
          recipes: storedRecipes.length,
          ingredients: storedIngredients.length,
          packagings: storedPackagings.length,
          totalExpenses
        });
        
        // Calcular custos das receitas para o gráfico
        const recipeCosts = storedRecipes.slice(0, 5).map(recipe => {
          const ingredientCost = recipe.recipe_ingredients?.reduce((sum, ri) => 
            sum + (Number(ri.quantity) * Number(ri.ingredients.cost_per_unit || ri.ingredients.costPerUnit || 0)), 0
          ) || 0;
          const packagingCost = recipe.recipe_packaging?.[0]?.packagings?.unit_cost ? 
            Number(recipe.recipe_packaging[0].packagings.unit_cost) : 0;
          
          return {
            name: recipe.name,
            custo: ingredientCost + packagingCost
          };
        });
        
        setCostData(recipeCosts);
        
        // Distribuição de despesas para o gráfico
        const expenseDistribution = storedExpenses.slice(0, 5).map(expense => ({
          name: expense.name,
          value: Number(expense.monthly_value || 0)
        }));
        
        setExpenseData(expenseDistribution);
        setLoading(false);
        return;
      }
      
      // Load counts
      const [recipesRes, ingredientsRes, packagingsRes, expensesRes] = await Promise.all([
        supabase.from('recipes').select('id', { count: 'exact', head: true }),
        supabase.from('ingredients').select('id', { count: 'exact', head: true }),
        supabase.from('packagings').select('id', { count: 'exact', head: true }),
        supabase.from('fixed_expenses').select('monthly_value')
      ]);

      const totalExpenses = expensesRes.data?.reduce((sum, exp) => sum + Number(exp.monthly_value), 0) || 0;

      setStats({
        recipes: recipesRes.count || 0,
        ingredients: ingredientsRes.count || 0,
        packagings: packagingsRes.count || 0,
        totalExpenses
      });

      // Load recipe costs for chart
      const { data: recipesData } = await supabase
        .from('recipes')
        .select(`
          name,
          recipe_ingredients (
            quantity,
            ingredients (
              cost_per_unit
            )
          ),
          recipe_packaging (
            packagings (
              unit_cost
            )
          )
        `)
        .limit(5);

      const recipeCosts = recipesData?.map(recipe => {
        const ingredientCost = recipe.recipe_ingredients?.reduce((sum, ri) => 
          sum + (Number(ri.quantity) * Number(ri.ingredients.cost_per_unit)), 0
        ) || 0;
        const packagingCost = Number(recipe.recipe_packaging?.[0]?.packagings?.unit_cost) || 0;
        
        return {
          name: recipe.name,
          custo: ingredientCost + packagingCost
        };
      }) || [];

      setCostData(recipeCosts);

      // Load expense distribution
      const { data: expensesData } = await supabase
        .from('fixed_expenses')
        .select('name, monthly_value')
        .limit(5);

      const expenseDistribution = expensesData?.map(expense => ({
        name: expense.name,
        value: Number(expense.monthly_value)
      })) || [];

      setExpenseData(expenseDistribution);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Receitas Cadastradas',
      value: stats.recipes.toString(),
      icon: ChefHat,
      gradient: `linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]})`,
      change: '+12%'
    },
    {
      title: 'Ingredientes',
      value: stats.ingredients.toString(),
      icon: ShoppingCart,
      gradient: `linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]})`,
      change: '+8%'
    },
    {
      title: 'Embalagens',
      value: stats.packagings.toString(),
      icon: Package,
      gradient: `linear-gradient(to right, ${colors.blue[500]}, ${colors.blue[600]})`,
      change: '+5%'
    },
    {
      title: 'Despesas Fixas',
      value: `R$ ${stats.totalExpenses.toFixed(0)}`,
      icon: DollarSign,
      gradient: `linear-gradient(to right, ${colors.purple[500]}, ${colors.purple[600]})`,
      change: '+3%'
    }
  ];

  const COLORS = [colors.primary[500], colors.secondary[500], colors.blue[500], colors.purple[500], colors.yellow[500]];

  if (loading) {
    return (
      <LoadingContainer>
        <div className="loading-icon">
          <TrendingUp size={32} color={colors.white} />
        </div>
        <p>Carregando dashboard...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Welcome Message */}
      {profile?.company_name && (
        <WelcomeCard>
          <WelcomeContent>
            <WelcomeIcon>
              <ChefHat size={24} color={colors.white} />
            </WelcomeIcon>
            <WelcomeText>
              <h2>Bem-vindo, {profile.company_name}!</h2>
              <p>Aqui está um resumo do seu negócio</p>
            </WelcomeText>
          </WelcomeContent>
        </WelcomeCard>
      )}

      {/* Stats Grid */}
      <StatsGrid>
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard key={index} hover>
              <StatContent>
                <StatInfo>
                  <p>{stat.title}</p>
                  <div className="value">{stat.value}</div>
                  <div className="change">
                    <TrendingUp size={16} />
                    <span>{stat.change}</span>
                  </div>
                </StatInfo>
                <StatIcon gradient={stat.gradient}>
                  <Icon size={24} color={colors.white} />
                </StatIcon>
              </StatContent>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ChartsGrid>
        {/* Recipe Costs Chart */}
        <ChartCard>
          <div className="chart-header">
            <h3>Custos por Receita</h3>
            <button onClick={loadDashboardData}>Atualizar</button>
          </div>
          <div className="chart-container">
            {costData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']} />
                  <Bar dataKey="custo" fill={colors.primary[500]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>Nenhuma receita cadastrada ainda</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Expense Distribution */}
        <ChartCard>
          <div className="chart-header">
            <h3>Distribuição de Despesas</h3>
            <button onClick={loadDashboardData}>Atualizar</button>
          </div>
          <div className="chart-container">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>Nenhuma despesa cadastrada ainda</p>
              </div>
            )}
          </div>
        </ChartCard>
      </ChartsGrid>

      {/* Monthly Summary */}
      <SummaryCard>
        <h3>Resumo Mensal</h3>
        <SummaryGrid>
          <SummaryItem 
            bg={colors.primary[50]} 
            iconColor={colors.primary[600]} 
            valueColor={colors.primary[600]}
          >
            <DollarSign size={32} />
            <div className="value">R$ {stats.totalExpenses.toFixed(2)}</div>
            <div className="label">Total de Despesas Fixas</div>
          </SummaryItem>
          <SummaryItem 
            bg={colors.secondary[50]} 
            iconColor={colors.secondary[600]} 
            valueColor={colors.secondary[600]}
          >
            <ChefHat size={32} />
            <div className="value">{stats.recipes}</div>
            <div className="label">Receitas Cadastradas</div>
          </SummaryItem>
          <SummaryItem 
            bg={colors.blue[50]} 
            iconColor={colors.blue[600]} 
            valueColor={colors.blue[600]}
          >
            <TrendingUp size={32} />
            <div className="value">{profile?.monthly_working_hours || 0}h</div>
            <div className="label">Horas de Funcionamento</div>
          </SummaryItem>
        </SummaryGrid>
      </SummaryCard>
    </Container>
  );
};