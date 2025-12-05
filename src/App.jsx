import React from 'react';
// BrowserRouter fornece o contexto de roteamento (history, location, etc).
// Aqui renomeamos para "Router" só por conveniência (alias).
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// AuthProvider: provê o contexto de autenticação para a árvore de componentes.
// useAuth: hook customizado que consome esse contexto (retorna user, loading, etc).
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas principais da aplicação — componentes que representam cada rota.
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { RecipesPage } from './pages/RecipesPage';
import { PackagingPage } from './pages/PackagingPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

// Componentes de layout — provavelmente visíveis em quase todas as páginas.
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';

// Estilos globais e um container de loading já estilizado (importado como alias).
import { GlobalStyle, LoadingContainer as StyledLoadingContainer } from './styles/GlobalStyles';

import styled from 'styled-components';

/* ===========================
   styled-components (CSS-in-JS)
   =========================== */

// AppContainer: container principal com display flex que ocupa a altura total da janela.
const AppContainer = styled.div`
  display: flex;
  height: 100vh;         /* faz a aplicação ocupar 100% da altura da viewport */
  background: #f8fafc;   /* tom de fundo claro */
`;

// MainContent: área onde ficam Header + conteúdo principal.
// flex:1 faz essa área ocupar o espaço restante ao lado do Sidebar.
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* evita que conteúdo externo "estoure" — o ContentArea controla as barras de rolagem */
`;

// ContentArea: o main que recebe o conteúdo das rotas.
// overflow-y: auto permite rolar só essa área (boa para layout com sidebar fixa).
const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
`;

/* ===========================
   LoadingContainer local
   ===========================
   NOTA: o arquivo também importou um LoadingContainer já estilizado
   como StyledLoadingContainer — aqui estamos reutilizando esse styled importado.
*/
const LoadingContainer = () => (
  <StyledLoadingContainer>
    <div className="loading-icon"> {/*Acrescentar fundo no ícone*/}
      {/* emoji para feedback visual rápido; pode ser substituído por spinner SVG/CSS */}
      <span style={{ fontSize: '32px' }}>🍳</span>
    </div>
    <p>Carregando...</p>
  </StyledLoadingContainer>
);

/* ===========================
   AppContent: componente que usa o contexto de autenticação
   =========================== */
function AppContent() {
  // usamos o hook do contexto de autenticação para saber se tem usuário e se está carregando.
  const { user, loading } = useAuth();

  // enquanto a verificação/recuperação do user estiver em andamento, mostramos um loading.
  if (loading) {
    return <LoadingContainer />;
  }

  // se não existe usuário autenticado, mostramos a tela de login.
  // Observação: como o Router fica **abaixo** desse return, LoginPage NÃO terá o contexto de roteamento
  // (useNavigate, Links) a menos que essa página implemente seu próprio Router ou use outra estratégia.
  if (!user) {
    return <LoginPage />;
  }

  // Se o usuário está autenticado, renderizamos a aplicação protegida com Router e rotas.
  return (
    <Router>
      <AppContainer>
        {/* GlobalStyle injeta estilos globais da aplicação (reset, fontes, etc). */}
        <GlobalStyle />
        {/* Sidebar geralmente é um painel lateral com links de navegação */}
        <Sidebar />
        
        <MainContent>
          {/* Header costuma mostrar título, ações, menu do usuário, etc */}
          <Header />
          
          <ContentArea>
            {/* Routes e Route vêm do react-router-dom v6.
                Cada Route mapeia um path para um elemento (componente). */}
            <Routes>
              {/* quando acessar "/", navegamos para "/dashboard" (redirecionamento) */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Rotas principais da aplicação */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ingredients" element={<IngredientsPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/packaging" element={<PackagingPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </ContentArea>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

/* ===========================
   App: provê o AuthProvider (contexto) para toda a árvore
   =========================== */
function App() {
  return (
    // AuthProvider injeta user/loading e métodos de login/logout nos componentes filhos.
    <AuthProvider>
      {/* OBS: GlobalStyle está sendo usado aqui também — cuidado para não duplicar */}
      <GlobalStyle />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
