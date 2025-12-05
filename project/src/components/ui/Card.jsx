import styled from 'styled-components';
import { colors } from '../../styles/GlobalStyles';

const CardContainer = styled.div`
  background: ${colors.white};
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.gray[100]};
  padding: ${props => {
    switch(props.padding) {
      case 'sm': return '16px';
      case 'lg': return '32px';
      default: return '24px';
    }
  }};
  transition: all 0.3s ease;
  
  ${props => props.hover && `
    &:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-color: ${colors.primary[200]};
    }
  `}
`;

export const Card = ({ children, className = '', padding = 'md', hover = false, ...props }) => {
  return (
    <CardContainer 
      className={className} 
      padding={padding} 
      hover={hover}
      {...props}
    >
      {children}
    </CardContainer>
  );
};