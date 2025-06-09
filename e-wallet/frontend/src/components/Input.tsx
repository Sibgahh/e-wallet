import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';

// Define input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

// Styled input container
const InputContainer = styled.div<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

// Styled input label
const InputLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
`;

// Styled input field
const StyledInput = styled.input<{ hasError: boolean }>`
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  background-color: white;
  color: #1f2937;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

// Styled error message
const ErrorMessage = styled.p`
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

// Input component with forward ref
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, ...props }, ref) => {
    return (
      <InputContainer fullWidth={fullWidth}>
        {label && <InputLabel>{label}</InputLabel>}
        <StyledInput ref={ref} hasError={!!error} {...props} />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputContainer>
    );
  }
);

// Set display name for the component
Input.displayName = 'Input';

export default Input; 