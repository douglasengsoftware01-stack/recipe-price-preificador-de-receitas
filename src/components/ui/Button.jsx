import React from 'react';
import styled from 'styled-components';
import { colors } from '../../styles/GlobalStyles';

const ButtonContainer = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: ${props => {
    switch(props.size) {
      case 'sm': return '14px';
      case 'lg': return '18px';
      default: return '16px';
    }
  }};
  padding: ${props => {
    switch(props.size) {
      case 'sm': return '8px 12px';
      case 'lg': return '12px 24px';
      default: return '10px 16px';
    }
  }};
  
  ${props => {
    switch(props.variant) {
      case 'secondary':
        return `
          background: ${colors.secondary[500]};
          color: ${colors.white};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          &:hover:not(:disabled) {
            background: ${colors.secondary[600]};
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        `;
      case 'danger':
        return `
          background: ${colors.red[500]};
          color: ${colors.white};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          &:hover:not(:disabled) {
            background: ${colors.red[600]};
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${colors.gray[700]};
          &:hover:not(:disabled) {
            background: ${colors.gray[100]};
          }
        `;
      default:
        return `
          background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
          color: ${colors.white};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          &:hover:not(:disabled) {
            background: linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[700]});
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid ${colors.primary[500]};
    outline-offset: 2px;
  }
`;

const LoadingSpinner = styled.svg`
  animation: spin 1s linear infinite;
  margin-right: 8px;
  width: 16px;
  height: 16px;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  disabled,
  ...props 
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner fill="none" viewBox="0 0 24 24">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
            opacity="0.25"
          />
          <path 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            opacity="0.75"
          />
        </LoadingSpinner>
      )}
      {children}
    </ButtonContainer>
  );
};