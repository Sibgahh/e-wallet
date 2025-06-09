import React, { ReactNode } from 'react';
import styled from 'styled-components';

// Define card props
interface CardProps {
  title?: string;
  children: ReactNode;
  padding?: string;
  border?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  className?: string;
}

// Styled card container
const CardContainer = styled.div<Omit<CardProps, 'title' | 'children'>>`
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  padding: ${props => props.padding || '1.5rem'};
  border: ${props => props.border ? '1px solid #e5e7eb' : 'none'};
  
  /* Card elevation variants */
  ${props => {
    switch (props.elevation) {
      case 'none':
        return 'box-shadow: none;';
      case 'low':
        return 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);';
      case 'medium':
        return 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);';
      case 'high':
        return 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);';
      default:
        return 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);';
    }
  }}
`;

// Styled card title
const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

// Card component
const Card: React.FC<CardProps> = ({
  title,
  children,
  padding = '1.5rem',
  border = true,
  elevation = 'low',
  className,
}) => {
  return (
    <CardContainer
      padding={padding}
      border={border}
      elevation={elevation}
      className={className}
    >
      {title && <CardTitle>{title}</CardTitle>}
      {children}
    </CardContainer>
  );
};

export default Card; 