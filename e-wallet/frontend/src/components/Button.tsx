import React, { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

// Define button variants
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';

// Define button props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
}

// Styled button component
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  /* Button variants */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #3b82f6;
          color: white;
          border: 1px solid #3b82f6;
          &:hover:not(:disabled) {
            background-color: #2563eb;
            border-color: #2563eb;
          }
        `;
      case 'secondary':
        return `
          background-color: #6b7280;
          color: white;
          border: 1px solid #6b7280;
          &:hover:not(:disabled) {
            background-color: #4b5563;
            border-color: #4b5563;
          }
        `;
      case 'danger':
        return `
          background-color: #ef4444;
          color: white;
          border: 1px solid #ef4444;
          &:hover:not(:disabled) {
            background-color: #dc2626;
            border-color: #dc2626;
          }
        `;
      case 'success':
        return `
          background-color: #10b981;
          color: white;
          border: 1px solid #10b981;
          &:hover:not(:disabled) {
            background-color: #059669;
            border-color: #059669;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          &:hover:not(:disabled) {
            background-color: rgba(59, 130, 246, 0.1);
          }
        `;
      default:
        return `
          background-color: #3b82f6;
          color: white;
          border: 1px solid #3b82f6;
          &:hover:not(:disabled) {
            background-color: #2563eb;
            border-color: #2563eb;
          }
        `;
    }
  }}
`;

// Loading spinner component
const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Button component
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};

export default Button; 