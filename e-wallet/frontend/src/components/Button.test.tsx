import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('sc-'); // styled-component class will start with sc-
  });
  
  it('renders with primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    
    const button = screen.getByText('Primary Button');
    expect(button).toBeInTheDocument();
    // Check for background color in computed style
    expect(window.getComputedStyle(button).backgroundColor).toBeTruthy();
  });
  
  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    
    let button = screen.getByText('Secondary');
    expect(button).toBeInTheDocument();
    
    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByText('Danger');
    expect(button).toBeInTheDocument();
    
    rerender(<Button variant="success">Success</Button>);
    button = screen.getByText('Success');
    expect(button).toBeInTheDocument();
    
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByText('Outline');
    expect(button).toBeInTheDocument();
  });
  
  it('renders fullWidth when specified', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    
    const button = screen.getByText('Full Width Button');
    expect(button).toBeInTheDocument();
    // Check width in computed style
    expect(window.getComputedStyle(button).width).toBe('100%');
  });
  
  it('renders loading state', () => {
    render(<Button isLoading>Loading Button</Button>);
    
    const button = screen.getByText('Loading Button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    // Check for loading spinner
    const spinner = button.querySelector('div'); // The LoadingSpinner is a div
    expect(spinner).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('does not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  it('does not trigger click when loading', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} isLoading>Loading Button</Button>);
    
    const button = screen.getByText('Loading Button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
}); 