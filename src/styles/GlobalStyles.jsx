import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8fafc;
    color: #1f2937;
    line-height: 1.5;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  input, button, select, textarea {
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export const colors = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#FFA500',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#90EE90',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  }
};

// Layout components
export const Container = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

export const HeaderContent = styled.div`
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

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: ${props => props.cols === 4 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'};
  }
`;

export const EmptyState = styled.div`
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

export const LoadingContainer = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
  
  .loading-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(to right, ${props => props.color || colors.primary[500]}, ${props => props.color || colors.primary[600]});
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

// Form components
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 16px;
  
  button {
    flex: 1;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.gray[700]};
`;

// Utility components
export const Flex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '12px'};
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

export const Text = styled.span`
  font-size: ${props => {
    switch(props.size) {
      case 'xs': return '12px';
      case 'sm': return '14px';
      case 'lg': return '18px';
      case 'xl': return '20px';
      case '2xl': return '24px';
      case '3xl': return '30px';
      default: return '16px';
    }
  }};
  font-weight: ${props => props.weight || 'normal'};
  color: ${props => props.color || colors.gray[900]};
  line-height: ${props => props.lineHeight || '1.5'};
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${colors.gray[200]};
  margin: ${props => props.margin || '16px 0'};
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch(props.variant) {
      case 'success': return colors.green[100];
      case 'warning': return colors.yellow[100];
      case 'error': return colors.red[100];
      case 'info': return colors.blue[100];
      default: return colors.gray[100];
    }
  }};
  color: ${props => {
    switch(props.variant) {
      case 'success': return colors.green[800];
      case 'warning': return colors.yellow[800];
      case 'error': return colors.red[800];
      case 'info': return colors.blue[800];
      default: return colors.gray[800];
    }
  }};
`;