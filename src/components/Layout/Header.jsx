import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Bell, Search } from 'lucide-react';
import { colors } from '../../styles/GlobalStyles';

const HeaderContainer = styled.header`
  background: ${colors.white};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid ${colors.gray[200]};
  padding: 16px 24px;
  min-height: 80px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageInfo = styled.div`
  h1 {
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray[900]};
  }
  
  p {
    color: ${colors.gray[600]};
    margin-top: 4px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 40px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  width: 256px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[500]}20;
  }
  
  &::placeholder {
    color: ${colors.gray[500]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
`;

const NotificationButton = styled.button`
  position: relative;
  padding: 8px;
  color: ${colors.gray[600]};
  background: none;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${colors.primary[600]};
    background: ${colors.gray[100]};
  }
`;

const NotificationDot = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: ${colors.primary[500]};
  border-radius: 50%;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const pageInfo = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral do seu negócio' },
  '/ingredients': { title: 'Ingredientes', subtitle: 'Gerencie ingredientes e custos' },
  '/recipes': { title: 'Receitas', subtitle: 'Organize suas receitas favoritas' },
  '/packaging': { title: 'Embalagens', subtitle: 'Controle custos de embalagem' },
  '/expenses': { title: 'Despesas Fixas', subtitle: 'Monitore gastos mensais' },
  '/pricing': { title: 'Precificação', subtitle: 'Calcule preços estratégicos' },
  '/settings': { title: 'Configurações', subtitle: 'Configure parâmetros da empresa' },
  '/profile': { title: 'Meu Perfil', subtitle: 'Gerencie suas informações pessoais' },
};

export const Header = () => {
  const location = useLocation();
  const currentPageInfo = pageInfo[location.pathname] || { title: 'RecipePrice', subtitle: '' };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <PageInfo>
          <h1>{currentPageInfo.title}</h1>
          {currentPageInfo.subtitle && <p>{currentPageInfo.subtitle}</p>}
        </PageInfo>
        
        <HeaderActions>
          <SearchContainer>
            <SearchIcon>
              <Search size={20} color={colors.gray[400]} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Pesquisar..."
            />
          </SearchContainer>
          
          <NotificationButton>
            <Bell size={20} />
            <NotificationDot />
          </NotificationButton>
        </HeaderActions>
      </HeaderContent>
    </HeaderContainer>
  );
};