import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Calculator,
  Settings,
  LogOut,
  User,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/GlobalStyles';

const SidebarContainer = styled.div`
  width: 256px;
  background: ${colors.white};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${colors.gray[200]};
`;

const SidebarHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${colors.gray[200]};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoContainer = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const LogoText = styled.div`
  h1 {
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray[900]};
  }
  
  p {
    font-size: 14px;
    color: ${colors.gray[500]};
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

const NavItem = styled(Link)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  
  ${props => props.$isActive ? `
    background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
    color: ${colors.white};
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    svg {
      color: ${colors.white};
    }
  ` : `
    color: ${colors.gray[700]};
    
    &:hover {
      background: ${colors.primary[50]};
      color: ${colors.primary[500]};
    }
    
    svg {
      color: ${colors.gray[500]};
    }
  `}
`;

const UserSection = styled.div`
  padding: 16px;
  border-top: 1px solid ${colors.gray[200]};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const AvatarPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
  
  p {
    font-size: 14px;
    font-weight: 500;
    color: ${colors.gray[900]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  span {
    font-size: 12px;
    color: ${colors.gray[500]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: ${colors.red[600]};
  background: none;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: ${colors.red[50]};
  }
`;

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/recipes', label: 'Receitas', icon: ChefHat },
  { path: '/ingredients', label: 'Ingredientes', icon: ShoppingCart },
  { path: '/packaging', label: 'Embalagens', icon: Package },
  { path: '/expenses', label: 'Despesas Fixas', icon: DollarSign },
  { path: '/pricing', label: 'Precificação', icon: Calculator },
  { path: '/settings', label: 'Configurações', icon: Settings },
  { path: '/profile', label: 'Meu Perfil', icon: UserCircle },
];

export const Sidebar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <SidebarContainer>
      <SidebarHeader>
        <HeaderContent>
          <LogoContainer>
            <ChefHat size={24} color={colors.white} />
          </LogoContainer>
          <LogoText>
            <h1>RecipePrice</h1>
            <p>Sistema de Precificação</p>
          </LogoText>
        </HeaderContent>
      </SidebarHeader>

      <Navigation>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavItem
              key={item.path}
              to={item.path}
              $isActive={isActive}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavItem>
          );
        })}
      </Navigation>

      <UserSection>
        <UserInfo>
          <Avatar>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <AvatarPlaceholder>
                <User size={16} color={colors.white} />
              </AvatarPlaceholder>
            )}
          </Avatar>
          <UserDetails>
            <p>{profile?.name || user?.name || 'Usuário'}</p>
            <span>{user?.email}</span>
          </UserDetails>
        </UserInfo>
        <LogoutButton onClick={signOut}>
          <LogOut size={16} />
          <span>Sair</span>
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};