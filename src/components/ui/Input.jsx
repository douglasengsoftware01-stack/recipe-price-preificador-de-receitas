import React from 'react';
import styled from 'styled-components';
import { colors } from '../../styles/GlobalStyles';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.gray[700]};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  display: block;
  width: 100%;
  border-radius: 8px;
  border: 1px solid ${colors.gray[300]};
  background: ${colors.white};
  padding: 10px 12px;
  font-size: 16px;
  color: ${colors.gray[900]};
  transition: all 0.2s ease;
  
  ${props => props.hasLeftIcon && 'padding-left: 40px;'}
  ${props => props.hasRightIcon && 'padding-right: 40px;'}
  
  &::placeholder {
    color: ${colors.gray[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[500]}20;
  }
  
  ${props => props.error && `
    border-color: ${colors.red[500]};
    &:focus {
      border-color: ${colors.red[500]};
      box-shadow: 0 0 0 3px ${colors.red[500]}20;
    }
  `}
`;

const IconContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.position === 'left' ? 'left: 12px;' : 'right: 12px;'}
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: ${colors.red[500]};
`;

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  type = 'text',
  value,
  onChange,
  ...props
}) => {
  const handleChange = (e) => {
    if (type === 'number') {
      // Para campos numéricos, permitir string vazia ou números válidos
      const inputValue = e.target.value;
      if (inputValue === '' || !isNaN(inputValue)) {
        onChange(e);
      }
    } else {
      onChange(e);
    }
  };

  return (
    <InputContainer>
      {label && <Label>{label}</Label>}
      
      
      <InputWrapper>
        {leftIcon && (
          <IconContainer position="left">
            {leftIcon}
          </IconContainer>
        )}
        
        <StyledInput
          type={type}
          value={value}
          onChange={handleChange}
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
          error={error}
          {...props}
        />
        
        {rightIcon && (
          <IconContainer position="right">
            {rightIcon}
          </IconContainer>
        )}
      </InputWrapper>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
    </InputContainer>
  );
};