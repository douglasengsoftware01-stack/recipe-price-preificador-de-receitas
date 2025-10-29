import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { colors } from '../../styles/GlobalStyles';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalContainer = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: ${props => {
    switch(props.size) {
      case 'sm': return '384px';
      case 'lg': return '672px';
      case 'xl': return '896px';
      default: return '512px';
    }
  }};
  padding: 24px;
  margin: 32px 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.gray[900]};
`;

const CloseButton = styled.button`
  padding: 8px;
  color: ${colors.gray[400]};
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${colors.gray[600]};
    background: ${colors.gray[100]};
  }
`;

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer 
        size={size} 
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>
        
        {children}
      </ModalContainer>
    </Overlay>
  );
};