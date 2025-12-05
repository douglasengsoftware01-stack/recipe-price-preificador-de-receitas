// Importações principais
import React, { useState, useEffect } from "react";
// styled-components: cria componentes React estilizados via template strings CSS
import styled from "styled-components";
// Ícones (biblioteca lucide-react)
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Search,
  TrendingUp,
} from "lucide-react";
// Componentes UI reutilizáveis (Card, Button, Input, Modal) — presumivelmente feitos no seu projeto
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
// Hook customizado de autenticação (fornece user, etc)
import { useAuth } from "../context/AuthContext";
// Cliente Supabase para operações no banco/storage
import { supabase } from "../lib/supabase";
// Paleta de cores centralizada
import { colors } from "../styles/GlobalStyles";

/* ============================
   styled-components: layout e estilos
   ============================ */

/* Container principal da página:
   - padding: espaçamento interno
   - flex-direction: coluna
   - gap: espaçamento entre seções
*/
const Container = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/* Header: área do título e botão de ação
   - em telas maiores vira uma linha (row) e os itens se justificam entre si
*/
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

/* HeaderContent: estilos internos do cabeçalho (título + subtítulo) */
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

/* SummaryCard: reutiliza o componente Card e aplica gradiente/borda */
const SummaryCard = styled(Card)`
  background: linear-gradient(
    to right,
    ${colors.purple[50]},
    ${colors.purple[100]}
  );
  border: 1px solid ${colors.purple[200]};
`;

/* Layout do conteúdo interno do resumo (informação à esquerda, estatísticas à direita) */
const SummaryContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .summary-info {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: ${colors.purple[900]};
      margin-bottom: 4px;
    }

    p {
      color: ${colors.purple[700]};
    }
  }

  .summary-stats {
    text-align: right;

    .total {
      font-size: 32px;
      font-weight: bold;
      color: ${colors.purple[900]};
      margin-bottom: 4px;
    }

    .count {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: ${colors.purple[700]};
      gap: 4px;
    }
  }
`;

/* Grid responsivo para os cards:
   - 1 coluna em mobile,
   - 2 colunas em medium,
   - 3 colunas em large
*/
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

/* ExpenseCard: usa Card estilizado; quando hover mostra ações (via .actions) */
const ExpenseCard = styled(Card)`
  position: relative;

  &:hover .actions {
    opacity: 1;
  }
`;

/* Cabeçalho interno do card (ícone + título + ações) */
const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

/* Container com ícone e detalhes da despesa */
const ExpenseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

/* Caixa do ícone (padrão quadrado com gradiente) */
const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(
    to right,
    ${colors.purple[500]},
    ${colors.purple[600]}
  );
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Títulos e subtítulos dentro do card */
const ExpenseDetails = styled.div`
  h3 {
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 2px;
  }

  p {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
`;

/* Container das ações (editar, excluir) — inicialmente oculta (opacity:0) */
const Actions = styled.div`
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  gap: 8px;
`;

/* Botão de ação (reutilizável) — aceita prop `danger` para variar cor no hover */
const ActionButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  color: ${colors.gray[600]};

  &:hover {
    color: ${(props) => (props.danger ? colors.red[600] : colors.primary[600])};
    background: ${(props) =>
      props.danger ? colors.red[50] : colors.primary[50]};
  }
`;

/* Estatísticas dentro do card (valor, % do total, data) */
const ExpenseStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span:first-child {
      font-size: 14px;
      color: ${colors.gray[600]};
    }

    span:last-child {
      font-weight: bold;
      color: ${colors.purple[600]};
    }
  }

  .percentage {
    font-size: 14px;
    font-weight: 500;
    color: ${colors.gray[700]};
  }

  .date {
    font-size: 12px;
    color: ${colors.gray[500]};
    padding-top: 8px;
    border-top: 1px solid ${colors.gray[100]};
  }
`;

/* Estado vazio (quando não há despesas ou busca não retornou nada) */
const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;

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
    margin-bottom: 24px;
  }
`;

/* Formulário dentro do modal */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* Botões do formulário alinhados */
const FormActions = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 16px;

  button {
    flex: 1;
  }
`;

/* Container de loading mostrado enquanto carrega as despesas */
const LoadingContainer = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;

  div {
    width: 64px;
    height: 64px;
    background: linear-gradient(
      to right,
      ${colors.purple[500]},
      ${colors.purple[600]}
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

/* ============================
   Componente principal: ExpensesPage
   ============================ */

export const ExpensesPage = () => {
  // Pega o usuário logado do contexto de autenticação
  const { user } = useAuth();

  // Estado que guarda lista de despesas carregadas
  const [expenses, setExpenses] = useState([]);

  // Controle do modal de criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Guarda a despesa que está sendo editada (ou null se for criar nova)
  const [editingExpense, setEditingExpense] = useState(null);

  // Texto da busca
  const [searchTerm, setSearchTerm] = useState("");

  // Flag de carregamento (inicia true até os dados serem obtidos)
  const [loading, setLoading] = useState(true);

  // Dados do formulário (nome e valor mensal)
  const [formData, setFormData] = useState({
    name: "",
    monthly_value: "",
  });

  /* 
    useEffect para carregar despesas quando o componente monta.
    OBSERVAÇÃO IMPORTANTE:
    - O array de dependências está vazio ([]), então essa função roda só no mount.
    - Se o `user` chegar depois (por exemplo auth resolve assincronamente), o loadExpenses pode rodar antes de `user` estar definido.
      -> Considere adicionar `user` em dependências: useEffect(() => { if(user) loadExpenses(); }, [user]);
  */
  useEffect(() => {
    loadExpenses();
  }, []);

  /* loadExpenses: carrega dados do Supabase (ou localStorage no modo demo) */
  const loadExpenses = async () => {
    try {
      // Branch para usuário demo (testes sem backend)
      if (user?.id === "demo-user-id") {
        // tenta ler do localStorage
        const storedExpenses = JSON.parse(
          localStorage.getItem("demo-expenses") || "[]"
        );

        if (storedExpenses.length === 0) {
          // se não tivermos nada, cria mock de exemplo e salva localmente
          const mockExpenses = [
            {
              id: "demo-expense-1",
              name: "Aluguel",
              monthly_value: 1500.0,
              created_at: new Date().toISOString(),
              user_id: "demo-user-id",
            },
            {
              id: "demo-expense-2",
              name: "Energia Elétrica",
              monthly_value: 300.0,
              created_at: new Date().toISOString(),
              user_id: "demo-user-id",
            },
            {
              id: "demo-expense-3",
              name: "Internet",
              monthly_value: 100.0,
              created_at: new Date().toISOString(),
              user_id: "demo-user-id",
            },
          ];
          localStorage.setItem("demo-expenses", JSON.stringify(mockExpenses));
          setExpenses(mockExpenses);
        } else {
          // se já existe, usa os dados do storage
          setExpenses(storedExpenses);
        }
        setLoading(false);
        return;
      }

      /* 
        Se não for demo, busca do Supabase:
        - from('fixed_expenses') — tabela de despesas fixas
        - select('*') — seleciona todas colunas
        - order('created_at', { ascending: false }) — ordena por data (mais novo primeiro)
        
        OBSERVAÇÕES IMPORTANTES:
        1) Aqui **não há filtro por user_id**. Isso significa que, tal como está, todos os registros da tabela
           serão retornados (dependendo das policies do Supabase). Em geral você deve filtrar:
             .eq('user_id', user.id)
           para retornar só as despesas do usuário logado.
        2) Se o `user` estiver indefinido no momento da chamada (ver nota do useEffect), pode haver comportamento inesperado.
      */
      const { data, error } = await supabase
        .from("fixed_expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  /* filteredExpenses: lista filtrada pela busca (nome) */
  const filteredExpenses = expenses.filter((expense) =>
    expense.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* totalMonthlyExpenses: soma simples do campo monthly_value */
  const totalMonthlyExpenses = expenses.reduce(
    (total, expense) => total + parseFloat(expense.monthly_value),
    0
  );
  /* NOTA: se expense.monthly_value for undefined ou uma string vazia, parseFloat pode resultar em NaN.
     É mais seguro usar: total + (parseFloat(expense.monthly_value) || 0)
  */

  /* handleSubmit: cria ou atualiza uma despesa */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return; // segurança: não faz nada se não houver usuário

    try {
      // Branch demo: simula criação/edição no localStorage
      if (user.id === "demo-user-id") {
        const newExpense = {
          id: "demo-expense-" + Date.now(), // id gerado localmente
          name: formData.name,
          monthly_value: parseFloat(formData.monthly_value) || 0,
          created_at: new Date().toISOString(),
          user_id: "demo-user-id",
        };

        if (editingExpense) {
          // atualizar um item existente no array local
          const updatedExpenses = expenses.map((exp) =>
            exp.id === editingExpense.id
              ? { ...editingExpense, ...newExpense, id: editingExpense.id }
              : exp
          );
          setExpenses(updatedExpenses);
          localStorage.setItem(
            "demo-expenses",
            JSON.stringify(updatedExpenses)
          );
        } else {
          // inserir novo no topo da lista
          const updatedExpenses = [newExpense, ...expenses];
          setExpenses(updatedExpenses);
          localStorage.setItem(
            "demo-expenses",
            JSON.stringify(updatedExpenses)
          );
        }

        // resetar modal e form
        setIsModalOpen(false);
        setEditingExpense(null);
        setFormData({ name: "", monthly_value: "" });
        return;
      }

      // Branch real (Supabase)
      if (editingExpense) {
        // Atualiza no banco pelo id
        const { error } = await supabase
          .from("fixed_expenses")
          .update({
            name: formData.name,
            monthly_value: parseFloat(formData.monthly_value) || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingExpense.id);

        if (error) throw error;

        // Atualizar estado local para refletir a alteração sem precisar recarregar tudo
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === editingExpense.id
              ? {
                  ...exp,
                  name: formData.name,
                  monthly_value: parseFloat(formData.monthly_value) || 0,
                }
              : exp
          )
        );
      } else {
        // Inserção: cria uma nova linha e retorna o registro inserido (por isso o .select())
        const { data, error } = await supabase
          .from("fixed_expenses")
          .insert([
            {
              name: formData.name,
              monthly_value: parseFloat(formData.monthly_value) || 0,
              user_id: user.id,
            },
          ])
          .select();

        if (error) throw error;

        // Adiciona o registro retornado ao estado local (data[0])
        if (data && data[0]) {
          setExpenses((prev) => [data[0], ...prev]);
        }
      }

      // Fecha modal e reseta form
      setIsModalOpen(false);
      setEditingExpense(null);
      setFormData({ name: "", monthly_value: "" });
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Erro ao salvar despesa: " + error.message);
    }
  };

  /* handleEdit: prepara o formulário para editar uma despesa existente */
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    // Preenche formData com valores existentes (monthly_value toString para input type=number)
    setFormData({
      name: expense.name,
      monthly_value: expense.monthly_value.toString(),
    });
    setIsModalOpen(true); // abre o modal
  };

  /* handleDelete: exclui uma despesa (confirmação via window.confirm) */
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      try {
        // Branch demo: exclui do localStorage
        if (user?.id === "demo-user-id") {
          const updatedExpenses = expenses.filter((exp) => exp.id !== id);
          setExpenses(updatedExpenses);
          localStorage.setItem(
            "demo-expenses",
            JSON.stringify(updatedExpenses)
          );
          return;
        }

        // Excluir na tabela do Supabase
        const { error } = await supabase
          .from("fixed_expenses")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Atualizar estado local imediatamente
        const updatedExpenses = expenses.filter((exp) => exp.id !== id);
        setExpenses(updatedExpenses);
        // também atualiza localStorage (curiosamente o código grava localStorage mesmo em branch real)
        localStorage.setItem("demo-expenses", JSON.stringify(updatedExpenses));
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Erro ao excluir despesa: " + error.message);
      }
    }
  };

  /* openNewModal: limpa edição e abre modal para criar novo */
  const openNewModal = () => {
    setEditingExpense(null);
    setFormData({ name: "", monthly_value: "" });
    setIsModalOpen(true);
  };

  /* Render de loading: mostrado enquanto `loading === true` */
  if (loading) {
    return (
      <LoadingContainer>
        <div>
          <DollarSign size={32} color={colors.white} />
        </div>
        <p>Carregando despesas...</p>
      </LoadingContainer>
    );
  }

  /* ============================
     JSX: estrutura da UI principal
     ============================ */
  return (
    <Container>
      {/* Cabeçalho: título + botão "Nova Despesa" */}
      <Header>
        <HeaderContent>
          <h1>Despesas Fixas</h1>
          <p>Gerencie suas despesas mensais para cálculo de rateio</p>
        </HeaderContent>
        <Button onClick={openNewModal}>
          <Plus size={16} style={{ marginRight: "8px" }} />
          Nova Despesa
        </Button>
      </Header>

      {/* Card com resumo (total e quantidade) */}
      <SummaryCard>
        <SummaryContent>
          <div className="summary-info">
            <h3>Total de Despesas Mensais</h3>
            <p>Soma de todas as despesas fixas cadastradas</p>
          </div>
          <div className="summary-stats">
            <div className="total">R$ {totalMonthlyExpenses.toFixed(2)}</div>
            <div className="count">
              <TrendingUp size={16} />
              {expenses.length} despesas cadastradas
            </div>
          </div>
        </SummaryContent>
      </SummaryCard>

      {/* Barra de busca dentro de um Card */}
      <Card>
        <Input
          placeholder="Pesquisar despesas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={20} color={colors.gray[400]} />}
        />
      </Card>

      {/* Grid que mapeia despesas para cards */}
      <Grid>
        {filteredExpenses.map((expense) => (
          <ExpenseCard key={expense.id} hover>
            <CardHeader>
              <ExpenseInfo>
                <IconContainer>
                  {/* Aqui você mostra um ícone fixo.
                      Se quiser imagem por despesa, substitua por:
                        <img src={expense.photo_url} alt={expense.name} />
                      e garanta que `photo_url` exista no seu model (BD). */}
                  <DollarSign size={24} color={colors.white} />
                </IconContainer>
                <ExpenseDetails>
                  <h3>{expense.name}</h3>
                  <p>Despesa fixa mensal</p>
                </ExpenseDetails>
              </ExpenseInfo>
              <Actions className="actions">
                {/* Botões de editar / excluir */}
                <ActionButton onClick={() => handleEdit(expense)}>
                  <Edit size={16} />
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(expense.id)}>
                  <Trash2 size={16} />
                </ActionButton>
              </Actions>
            </CardHeader>

            {/* Estatísticas do card */}
            <ExpenseStats>
              <div className="stat-row">
                <span>Valor mensal:</span>
                <span>R$ {parseFloat(expense.monthly_value).toFixed(2)}</span>
              </div>
              <div className="stat-row">
                <span>% do total:</span>
                <span className="percentage">
                  {totalMonthlyExpenses > 0
                    ? (
                        (parseFloat(expense.monthly_value) /
                          totalMonthlyExpenses) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="date">
                Criado em{" "}
                {new Date(expense.created_at).toLocaleDateString("pt-BR")}
              </div>
            </ExpenseStats>
          </ExpenseCard>
        ))}

        {/* Empty state: aparece se não houver resultados após filtragem */}
        {filteredExpenses.length === 0 && (
          <EmptyState>
            <DollarSign size={64} />
            <h3>
              {searchTerm
                ? "Nenhuma despesa encontrada"
                : "Nenhuma despesa cadastrada"}
            </h3>
            <p>
              {searchTerm
                ? "Tente buscar com outros termos"
                : "Comece adicionando sua primeira despesa fixa"}
            </p>
            {!searchTerm && (
              <Button onClick={openNewModal}>
                <Plus size={16} style={{ marginRight: "8px" }} />
                Adicionar Despesa
              </Button>
            )}
          </EmptyState>
        )}
      </Grid>

      {/* Modal para criar/editar despesa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? "Editar Despesa" : "Nova Despesa"}
      >
        <Form onSubmit={handleSubmit}>
          {/* Input do nome */}
          <Input
            label="Nome da Despesa"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ex: Aluguel, Energia elétrica, Internet"
            required
          />

          {/* Input do valor mensal */}
          <Input
            label="Valor Mensal (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.monthly_value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                monthly_value: e.target.value,
              }))
            }
            placeholder=""
            leftIcon={
              <span style={{ color: colors.gray[500], fontSize: "14px" }}>
                R$
              </span>
            }
            required
          />

          <FormActions>
            <Button type="submit">
              {editingExpense ? "Atualizar" : "Criar"} Despesa
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </Container>
  );
};
