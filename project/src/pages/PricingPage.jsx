// Arquivo: PricingPage.jsx (comentado detalhadamente)
// Objetivo: Página de precificação que carrega receitas e despesas do Supabase
// e calcula o preço sugerido por unidade considerando ingredientes, embalagem,
// rateio de despesas fixas por tempo de preparo e despesas variáveis (taxas, comissões, etc.).
// Também permite gerar relatórios em PDF e Excel.

import { useQuery } from "@tanstack/react-query";
//Substituir useEfeect na liha 499

// ------------------------- IMPORTS -------------------------
// Importa o React e hooks necessários
import React, { useState } from "react";
// styled-components para criação de estilos encapsulados
import styled from "styled-components";
// Ícones da biblioteca lucide-react (usados em vários pontos da UI)
import {
  Calculator,
  ChefHat,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Clock,
  Percent,
  FileText,
} from "lucide-react";
// Componentes de UI personalizados do projeto
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
// Contexto de autenticação (fornece profile do usuário)
import { useAuth } from "../context/AuthContext";
// Cliente Supabase para leitura de dados
import { supabase } from "../lib/supabase";
// Funções utilitárias para gerar PDF e Excel
import { generatePricingReport } from "../utils/pdfGenerator";
import { generatePricingExcel } from "../utils/excelGenerator";
// Estilos globais (cores, Container)
import { colors, Container } from "../styles/GlobalStyles";

// ------------------------- STYLED COMPONENTS -------------------------
// Cada styled component abaixo descreve um bloco de estilo usado na UI.
// Comentários explicam a intenção visual / responsividade.

const Header = styled.div`
  /* Cabeçalho responsivo: coluna em telas pequenas, linha em telas grandes */
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
  /* Texto do cabeçalho (título + subtítulo) */
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
  /* Layout principal: uma coluna em mobile, duas colunas em desktop
     (conteúdo principal + painel de resultados) */
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const FormSection = styled.div`
  /* Área onde ficam os controles/inputs para parâmetros */
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ResultsSection = styled.div`
  /* Painel lateral que exibe resultado da precificação */
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Select = styled.select`
  /* Estilo básico para selects (combobox) */
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
  /* Label padrão para inputs */
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.gray[700]};
  margin-bottom: 8px;
`;

const VariableExpensesGrid = styled.div`
  /* Grid para campos de despesas variáveis (Taxas, Comissões, Outras) */
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PriceResultCard = styled(Card)`
  /* Cartão de destaque para o preço sugerido com um degradê leve */
  background: linear-gradient(
    to right,
    ${colors.secondary[50]},
    ${colors.secondary[100]}
  );
  border: 1px solid ${colors.secondary[200]};
  text-align: center;
`;

const PriceIcon = styled.div`
  /* Ícone circular no topo do cartão de preço */
  width: 64px;
  height: 64px;
  background: linear-gradient(
    to right,
    ${colors.secondary[500]},
    ${colors.secondary[600]}
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const PriceValue = styled.div`
  /* Valor do preço (grande e em destaque) */
  font-size: 32px;
  font-weight: bold;
  color: ${colors.secondary[900]};
  margin-bottom: 8px;
`;

const PriceLabel = styled.p`
  color: ${colors.secondary[700]};
`;

const CostBreakdown = styled.div`
  /* Container para listagem dos componentes do custo */
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CostRow = styled.div`
  /* Linha de custo: label à esquerda e valor à direita */
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
  /* Linha específica para o lucro com destaque na cor secundária */
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
  /* Cartão que contém informações detalhadas da receita selecionada */
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 16px;
  }
`;

const RecipeHeader = styled.div`
  /* Cabeçalho dentro do card de receita (ícone + nome) */
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const RecipeIcon = styled.div`
  /* Caixa do ícone da receita */
  width: 48px;
  height: 48px;
  background: linear-gradient(
    to right,
    ${colors.primary[500]},
    ${colors.primary[600]}
  );
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecipeInfo = styled.div`
  /* Texto com nome da receita e contagem de ingredientes */
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
  /* Linha para cada ingrediente mostrando nome/quantidade e custo */
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
  /* Linha dedicada à informação de embalagem (nome + custo unitário) */
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
  /* Cartão para informações adicionais (margem, tempo, etc.) */
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 16px;
  }
`;

const InfoRow = styled.div`
  /* Linha de informação simples (label + valor) */
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
  /* Cartão que explica funcionalidade de geração de relatórios */
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
  /* Estado vazio que incentiva o usuário a calcular */
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
  /* Container exibido enquanto os dados carregam */
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;

  .loading-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(
      to right,
      ${colors.primary[500]},
      ${colors.primary[600]}
    );
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
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const WarningCard = styled(Card)`
  /* Cartão de aviso para indicar que falta configurar horas mensais */
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

// ------------------------- COMPONENTE PRINCIPAL -------------------------
export const PricingPage = () => {
  // Pega informações do usuário (profile) do contexto de autenticação
  const { profile } = useAuth();

  // Estados principais:
  const [recipes, setRecipes] = useState([]); // lista de receitas carregadas
  const [fixedExpenses, setFixedExpenses] = useState([]); // despesas fixas mensais
  const [loading, setLoading] = useState(true); // controle de carregamento inicial
  const [selectedRecipeId, setSelectedRecipeId] = useState(""); // id da receita selecionada
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(0); // tempo de preparo padrão (min)
  const [taxesPercent, setTaxesPercent] = useState(0); // percentuais variáveis padrão
  const [commissionsPercent, setCommissionsPercent] = useState(0);
  const [othersPercent, setOthersPercent] = useState(0);
  const [desiredProfitPercent, setDesiredProfitPercent] = useState(0); // lucro desejado em %
  const [calculation, setCalculation] = useState(null); // objeto com resultado da precificação

  // Derived: receita selecionada (objeto) a partir do id
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  // ------------------------- carregamento de dados -------------------------
  // useEffect sem dependências -> executa apenas no mount

  //Ajustar
  React.useEffect(() => {
    loadData();
  }, []);
  //Fim do ajuste

  // Função para carregar receitas e despesas do Supabase (ou localStorage para demo)
  const loadData = async () => {
    try {
      // Se existir um "demo-user" em localStorage, usamos dados mockados locais
      const user = JSON.parse(localStorage.getItem("demo-user") || "{}");
      if (user.id === "demo-user-id") {
        // Carrega receitas/expenses de localStorage — útil para demos sem Supabase
        const storedRecipes = JSON.parse(
          localStorage.getItem("demo-recipes") || "[]"
        );
        const storedExpenses = JSON.parse(
          localStorage.getItem("demo-expenses") || "[]"
        );

        setRecipes(storedRecipes);
        setFixedExpenses(storedExpenses);
        setLoading(false);
        return;
      }

      // ------------------------- Supabase: carregar receitas -------------------------
      // Faz query na tabela "recipes" incluindo ingredientes e embalagem relacionada
      const { data: recipesData, error: recipesError } = await supabase.from(
        "recipes"
      ).select(`
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

      // Transforma o retorno da query para um formato mais simples esperado pelo componente
      const transformedRecipes =
        recipesData?.map((recipe) => ({
          id: recipe.id,
          name: recipe.name,
          imageUrl: recipe.image_url,
          // Mapeia cada relacionamento recipe_ingredients para incluir id do ingrediente,
          // dados do ingrediente e a quantidade usada na receita
          ingredients: recipe.recipe_ingredients.map((ri) => ({
            id: ri.ingredients.id,
            ingredient: ri.ingredients,
            quantity: ri.quantity,
          })),
          // Seleciona a primeira embalagem relacionada (se houver)
          packaging: recipe.recipe_packaging[0]?.packagings || undefined,
          createdAt: recipe.created_at,
          userId: recipe.user_id,
        })) || [];

      setRecipes(transformedRecipes);

      // ------------------------- Supabase: carregar despesas fixas -------------------------
      const { data: expensesData, error: expensesError } = await supabase
        .from("fixed_expenses")
        .select("*");

      if (expensesError) throw expensesError;

      const transformedExpenses =
        expensesData?.map((expense) => ({
          id: expense.id,
          name: expense.name,
          monthlyValue: expense.monthly_value,
          createdAt: expense.created_at,
          userId: expense.user_id,
        })) || [];

      setFixedExpenses(transformedExpenses);
    } catch (error) {
      // Em caso de erro, logamos no console — pode-se adicionar notificação ao usuário aqui
      console.error("Error loading data:", error);
    } finally {
      // Sempre desliga o loading independente do resultado
      setLoading(false);
    }
  };

  {
    /*// ------------------------- função de cálculo -------------------------
  // calculatePricing monta o cálculo de custos completos e sugere um preço
  const calculatePricing = () => {
    if (!selectedRecipe) return; // se não houver receita selecionada, aborta

    // A lógica aceita duas formas possíveis de estrutura (dependendo de como os dados vieram):
    // - selectedRecipe.ingredients (transformado no loadData)
    // - selectedRecipe.recipe_ingredients (se os dados vieram sem transformação)
    const ingredientsArray =
      selectedRecipe.ingredients || selectedRecipe.recipe_ingredients || [];

    // Determina objeto de embalagem (padrões distintos dependendo da origem dos dados)
    const packagingObject =
      selectedRecipe.packaging ||
      selectedRecipe.recipe_packaging?.[0]?.packagings ||
      null;

    // Calcula custo total de ingredientes somando cost_per_unit * quantidade
    // Observação: lida com nomes de campos diferentes (ingredient. vs ingredients.)
    const ingredientCosts = ingredientsArray.reduce((total, ri) => {
      const ingredientCost =
        ri.ingredient?.cost_per_unit || ri.ingredients?.cost_per_unit || 0;
      return total + ingredientCost * (ri.quantity || 0);
    }, 0);

    // Custo unitário de embalagem (se existir)
    const packagingCost = packagingObject?.unit_cost || 0;

    // Soma das despesas fixas mensais — lida com nomes de campo diferentes
    const totalFixedExpenses = fixedExpenses.reduce(
      (total, expense) =>
        total +
        (expense.monthlyValue || expense.monthly_value || expense.value || 0),
      0
    );

    // Se profile informar monthly_working_hours, utilizamos para ratear despesas por hora
    const monthlyHours = profile?.monthly_working_hours || 160;
    const costPerHour = totalFixedExpenses / monthlyHours;
    const preparationHours = (preparationTimeMinutes || 0) / 60;
    const fixedExpenseAllocation = costPerHour * preparationHours;
    // Essa alocação representa quanto das despesas fixas são atribuídas a essa unidade
    // com base no tempo de preparo.

    // Custo base = ingredientes + embalagem + rateio de despesas fixas
    const baseCost = ingredientCosts + packagingCost + fixedExpenseAllocation;

    // Despesas variáveis calculadas como porcentagem do baseCost
    const taxes = baseCost * ((taxesPercent || 0) / 100);
    const commissions = baseCost * ((commissionsPercent || 0) / 100);
    const others = baseCost * ((othersPercent || 0) / 100);

    const totalVariableExpenses = taxes + commissions + others;
    // Custo total já incluindo variáveis
    const totalCost = baseCost + totalVariableExpenses;
    // Lucro desejado calculado sobre o custo total
    const desiredProfit = totalCost * ((desiredProfitPercent || 0) / 100);
    // Preço sugerido = custo total + lucro desejado
    const suggestedPrice = totalCost + desiredProfit;

    // Armazena o objeto de cálculo no estado para ser exibido no UI
    setCalculation({
      ingredientCosts,
      packagingCost,
      fixedExpenseAllocation,
      variableExpenses: {
        taxes,
        commissions,
        others,
        total: totalVariableExpenses,
      },
      totalCost,
      desiredProfit,
      suggestedPrice,
    });
  };*/
  }

  // ------------------------- função de cálculo -------------------------
  const calculatePricing = async () => {
    if (!selectedRecipe) return;

    const ingredientsArray =
      selectedRecipe.ingredients || selectedRecipe.recipe_ingredients || [];

    const packagingObject =
      selectedRecipe.packaging ||
      selectedRecipe.recipe_packaging?.[0]?.packagings ||
      null;

    const ingredientCosts = ingredientsArray.reduce((total, ri) => {
      const ingredientCost =
        ri.ingredient?.cost_per_unit || ri.ingredients?.cost_per_unit || 0;
      return total + ingredientCost * (ri.quantity || 0);
    }, 0);

    const packagingCost = packagingObject?.unit_cost || 0;

    const totalFixedExpenses = fixedExpenses.reduce(
      (total, expense) =>
        total +
        (expense.monthlyValue || expense.monthly_value || expense.value || 0),
      0
    );

    const monthlyHours = profile?.monthly_working_hours || 160;
    const costPerHour = totalFixedExpenses / monthlyHours;
    const preparationHours = (preparationTimeMinutes || 0) / 60;

    const fixedExpenseAllocation = costPerHour * preparationHours;

    // === NOVA LÓGICA DE PRECIFICAÇÃO ===
    // Base: ingredientes + embalagem + rateio de fixas
    const baseCost = ingredientCosts + packagingCost + fixedExpenseAllocation;

    // Percentuais
    const taxesPercentValue = taxesPercent || 0;
    const commissionsPercentValue = commissionsPercent || 0;
    const othersPercentValue = othersPercent || 0;
    const desiredProfitValue = desiredProfitPercent || 0;

    // Soma total dos percentuais que incidem sobre o preço final
    const divisorPercent =
      taxesPercentValue +
      commissionsPercentValue +
      othersPercentValue +
      desiredProfitValue;

    const divisor = 1 - divisorPercent / 100;

    const suggestedPrice = divisor <= 0 ? 0 : baseCost / divisor;

    // Cálculo das despesas variáveis agora baseadas no preço final
    const taxes = suggestedPrice * (taxesPercentValue / 100);
    const commissions = suggestedPrice * (commissionsPercentValue / 100);
    const others = suggestedPrice * (othersPercentValue / 100);

    const totalVariableExpenses = taxes + commissions + others;

    // Lucro desejado também é percentual do preço sugerido
    const desiredProfit = suggestedPrice * (desiredProfitValue / 100);

    setCalculation({
      ingredientCosts,
      packagingCost,
      fixedExpenseAllocation,
      variableExpenses: {
        taxes,
        commissions,
        others,
        total: totalVariableExpenses,
      },
      totalCost: baseCost, // custo antes dos percentuais
      desiredProfit,
      suggestedPrice,
    });
    
    //cad preço

    try {
    const { error } = await supabase
        .from("recipes")
        .update({ price: suggestedPrice })
        .eq("id", selectedRecipe.id);

        if (error) {
        console.error("Erro ao salvar preço no Supabase:", error);
        } else {
        console.log(
        `Preço de venda atualizado: R$ ${suggestedPrice.toFixed(2)}`
      );
    }
  } catch (err) {
    console.error("Erro inesperado ao salvar preço:", err);
  }
  //fim cad preço  







  };

  /*Fim do código ajustado*/

  // ------------------------- utilitários de UI -------------------------
  // Reset simples para limpar seleção e resultado
  const resetCalculation = () => {
    setCalculation(null);
    setSelectedRecipeId("");
  };

  // Geração de relatório (PDF) usando utilitário externo
  const generateReport = () => {
    if (!calculation || !selectedRecipe) return;

    const report = {
      recipe: selectedRecipe,
      calculation,
      preparationTime: preparationTimeMinutes,
      taxesPercent,
      commissionsPercent,
      othersPercent,
      desiredProfitPercent,
    };

    // Função externa que monta e faz download do PDF
    generatePricingReport([report], profile?.company_name);
  };

  // Geração de relatório (Excel) usando utilitário externo
  const generateExcelReport = () => {
    if (!calculation || !selectedRecipe) return;

    const report = {
      recipe: selectedRecipe,
      calculation,
      preparationTime: preparationTimeMinutes,
      taxesPercent,
      commissionsPercent,
      othersPercent,
      desiredProfitPercent,
    };

    generatePricingExcel([report], profile?.company_name);
  };

  // ------------------------- estado de carregamento -------------------------
  // Se estiver carregando, exibe placeholder de loading
  if (loading) {
    return (
      <LoadingContainer>
        <div className="loading-icon">
          {/* Ícone de calculadora dentro do círculo de loading */}
          <Calculator size={32} color={colors.white} />
        </div>
        <p>Carregando dados...</p>
      </LoadingContainer>
    );
  }

  // ------------------------- RENDER PRINCIPAL -------------------------
  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Calculadora de Preços</h1>
          <p>
            Calcule o preço ideal para suas receitas considerando todos os
            custos
          </p>
        </HeaderContent>
      </Header>

      {/* Settings Warning: se o usuário não tem monthly_working_hours configurado,
          exibimos um aviso pedindo para configurar (pois isso afeta o rateio). */}
      {!profile?.monthly_working_hours && (
        <WarningCard>
          <div className="warning-content">
            <div className="warning-icon">
              <Clock size={20} color={colors.white} />
            </div>
            <div className="warning-text">
              <h3>Configuração Necessária</h3>
              <p>
                Configure as horas de funcionamento da empresa nas Configurações
                para usar o rateio por tempo.
              </p>
            </div>
          </div>
        </WarningCard>
      )}

      <Grid>
        {/* -------------------- Form Section (esquerda) -------------------- */}
        <FormSection>
          <Card>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: colors.gray[900],
                marginBottom: "24px",
              }}
            >
              Parâmetros de Precificação
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Recipe Selection:
                  - Select que lista as receitas carregadas
                  - Ao mudar a receita, limpamos o cálculo anterior (evita confusão) */}
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
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Preparation Time:
                  - Input numérico para ajustar o tempo de preparo (em minutos)
                  - Atualiza o estado preparationTimeMinutes */}
              <Input
                label="Tempo de Preparo"
                type="number"
                min="1"
                value={preparationTimeMinutes}
                onChange={(e) =>
                  setPreparationTimeMinutes(parseInt(e.target.value) || 30)
                }
                placeholder="30"
                leftIcon={<Clock size={20} color={colors.gray[400]} />}
                rightIcon={
                  <span style={{ color: colors.gray[500], fontSize: "14px" }}>
                    min
                  </span>
                }
              />

              {/* Variable Expenses:
                  - Taxas, Comissões e Outras despesas expressas em %
                  - Mostramos o total somado logo abaixo */}
              <div>
                <Label style={{ marginBottom: "16px" }}>
                  Despesas Variáveis (%)
                </Label>
                <VariableExpensesGrid>
                  <Input
                    label="Taxas"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxesPercent}
                    onChange={(e) =>
                      setTaxesPercent(parseFloat(e.target.value) || 0)
                    }
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
                    onChange={(e) =>
                      setCommissionsPercent(parseFloat(e.target.value) || 0)
                    }
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
                    onChange={(e) =>
                      setOthersPercent(parseFloat(e.target.value) || 0)
                    }
                    placeholder="2"
                    leftIcon={<Percent size={16} color={colors.gray[400]} />}
                  />
                </VariableExpensesGrid>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: colors.gray[600],
                  }}
                >
                  {/* Mostra soma das porcentagens para feedback imediato */}
                  Total:{" "}
                  {(taxesPercent + commissionsPercent + othersPercent).toFixed(
                    1
                  )}
                  %
                </div>
              </div>

              {/* Desired Profit:
                  - Percentual de lucro desejado aplicado sobre o custo total */}
              <Input
                label="Lucro Desejado (%)"
                type="number"
                step="0.1"
                min="0"
                value={desiredProfitPercent}
                onChange={(e) =>
                  setDesiredProfitPercent(parseFloat(e.target.value) || 0)
                }
                placeholder="30"
                leftIcon={<Percent size={20} color={colors.gray[400]} />}
              />

              {/* Botões: Calcular e Limpar
                  - Botão Calcular só fica ativo se houver receita selecionada
                    e se monthly_working_hours estiver configurado (para o rateio) */}
              <div style={{ display: "flex", gap: "16px" }}>
                <Button
                  onClick={calculatePricing}
                  disabled={
                    !selectedRecipeId || !profile?.monthly_working_hours
                  }
                  style={{ flex: 1 }}
                >
                  <Calculator size={16} style={{ marginRight: "8px" }} />
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

          {/* -------------------- Recipe Details (aparece se há receita selecionada) -------------------- */}
          {selectedRecipe && (
            <RecipeDetailsCard>
              <h3>Detalhes da Receita</h3>

              <RecipeHeader>
                <RecipeIcon>
                  <ChefHat size={24} color={colors.white} />
                </RecipeIcon>
                <RecipeInfo>
                  <h4>{selectedRecipe.name}</h4>
                  <p>
                    {/* Mostra número de ingredientes com fallback para 0 */}
                    {selectedRecipe.recipe_ingredients?.length || 0}{" "}
                    ingredientes
                  </p>
                </RecipeInfo>
              </RecipeHeader>

              {/* Ingredients List:
                  - Lista cada ingrediente com quantidade e custo calculado
                  - Usa selectedRecipe.recipe_ingredients que vem do fetch original.
                  - Se usar a estrutura transformada (selectedRecipe.ingredients),
                    aqui pode ser necessário adaptar (atualmente está usando
                    recipe_ingredients para exibição). */}
              {selectedRecipe.recipe_ingredients &&
                selectedRecipe.recipe_ingredients.length > 0 && (
                  <div>
                    <h5
                      style={{
                        fontWeight: "500",
                        color: colors.gray[900],
                        marginBottom: "12px",
                      }}
                    >
                      Ingredientes:
                    </h5>
                    <IngredientsList>
                      {selectedRecipe.recipe_ingredients.map((ri) => (
                        <IngredientRow key={ri.ingredients.id}>
                          <div className="ingredient-info">
                            <ShoppingCart size={16} color={colors.gray[500]} />
                            <span>
                              {ri.ingredients.name} ({ri.quantity}{" "}
                              {ri.ingredients.unit})
                            </span>
                          </div>
                          <span className="ingredient-cost">
                            R${" "}
                            {(
                              ri.ingredients.cost_per_unit * ri.quantity
                            ).toFixed(2)}
                          </span>
                        </IngredientRow>
                      ))}
                    </IngredientsList>
                  </div>
                )}

              {/* Packaging:
                  - Exibe a embalagem vinculada (se houver) e seu custo unitário */}
              {selectedRecipe.recipe_packaging &&
                selectedRecipe.recipe_packaging[0] && (
                  <div style={{ marginTop: "16px" }}>
                    <PackagingRow>
                      <div className="packaging-info">
                        <Package size={16} color={colors.blue[600]} />
                        <span>
                          {selectedRecipe.recipe_packaging[0].packagings.name}
                        </span>
                      </div>
                      <span className="packaging-cost">
                        R${" "}
                        {selectedRecipe.recipe_packaging[0].packagings.unit_cost.toFixed(
                          2
                        )}
                      </span>
                    </PackagingRow>
                  </div>
                )}
            </RecipeDetailsCard>
          )}
        </FormSection>

        {/* -------------------- Results Section (direita) -------------------- */}
        <ResultsSection>
          {calculation ? (
            <>
              {/* Price Result: cartão com preço sugerido */}
              <PriceResultCard>
                <PriceIcon>
                  <TrendingUp size={32} color={colors.white} />
                </PriceIcon>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: colors.secondary[900],
                    marginBottom: "8px",
                  }}
                >
                  Preço Sugerido
                </h3>
                <PriceValue>
                  R$ {calculation.suggestedPrice.toFixed(2)}
                </PriceValue>
                <PriceLabel>Por unidade</PriceLabel>
              </PriceResultCard>

              {/* Cost Breakdown: exibe componente por componente do custo */}
              <Card>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: colors.gray[900],
                    marginBottom: "16px",
                  }}
                >
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
                    <span>
                      R$ {calculation.fixedExpenseAllocation.toFixed(2)}
                    </span>
                  </CostRow>

                  <CostRow>
                    <span>Taxas ({taxesPercent}%):</span>
                    <span>
                      R$ {calculation.variableExpenses.taxes.toFixed(2)}
                    </span>
                  </CostRow>

                  <CostRow>
                    <span>Comissões ({commissionsPercent}%):</span>
                    <span>
                      R$ {calculation.variableExpenses.commissions.toFixed(2)}
                    </span>
                  </CostRow>

                  <CostRow>
                    <span>Outras ({othersPercent}%):</span>
                    <span>
                      R$ {calculation.variableExpenses.others.toFixed(2)}
                    </span>
                  </CostRow>

                  <CostRow>
                    <span>Custo Total:</span>
                    <span>
                      {/* Observação: aqui o "Custo Total" é mostrado como suggestedPrice - desiredProfit
                          que corresponde ao costTotal calculado anteriormente. */}
                      R${" "}
                      {(
                        calculation.suggestedPrice - calculation.desiredProfit
                      ).toFixed(2)}
                    </span>
                  </CostRow>

                  <ProfitRow>
                    <span>Lucro ({desiredProfitPercent}%):</span>
                    <span>R$ {calculation.desiredProfit.toFixed(2)}</span>
                  </ProfitRow>
                </CostBreakdown>
              </Card>

              {/* Additional Info: margem e tempo de preparo */}
              <AdditionalInfoCard>
                <h3>Informações Adicionais</h3>

                <InfoRow>
                  <span>Margem de lucro:</span>
                  <span>
                    {(
                      (calculation.desiredProfit / calculation.suggestedPrice) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </InfoRow>

                <InfoRow>
                  <span>Tempo de preparo:</span>
                  <span>{preparationTimeMinutes} minutos</span>
                </InfoRow>

                {/* Observação: campo de custo por hora estava comentado no original.
                   Mantive comentado pois exibe cálculo que pode confundir se as
                   estruturas de fixedExpenses diferirem. */}
                {/*Ocultando o custo por hora no resumo do preço*/}
                {/*<InfoRow>
                  <span>Custo por hora (despesas fixas):</span>
                  <span>
                    R${" "}
                    {profile?.monthly_working_hours
                      ? (
                          fixedExpenses.reduce(
                            (total, expense) => total + expense.monthly_value,
                            0
                          ) / profile.monthly_working_hours
                        ).toFixed(2)
                      : "0,00"}
                  </span>
                </InfoRow>*/}
              </AdditionalInfoCard>

              {/* ReportCard: botões para gerar PDF e Excel usando as funções utilitárias */}
              <ReportCard>
                <h3>Relatório</h3>
                <p>
                  Gere um relatório completo com todos os detalhes da
                  precificação desta receita.
                </p>
                <ReportButtons>
                  {/*<Button onClick={generateReport} variant="secondary">
                    <FileText size={16} style={{ marginRight: "8px" }} />
                    Gerar Relatório PDF
                  </Button>*/}
                  <Button onClick={generateExcelReport} variant="ghost">
                    <FileText size={16} style={{ marginRight: "8px" }} />
                    Gerar Relatório Excel
                  </Button>
                </ReportButtons>
              </ReportCard>
            </>
          ) : (
            // Estado quando não há cálculo realizado: incentivamos a seleção/calcular
            <EmptyStateCard>
              <Calculator size={64} />
              <h3>Calcule o Preço</h3>
              <p>
                Selecione uma receita e configure os parâmetros para calcular o
                preço ideal
              </p>
            </EmptyStateCard>
          )}
        </ResultsSection>
      </Grid>
    </Container>
  );
};
