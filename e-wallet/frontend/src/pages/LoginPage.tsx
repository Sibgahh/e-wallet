import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

// Styled container
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
`;

// Styled login card
const LoginCard = styled(Card)`
  width: 100%;
  max-width: 24rem;
`;

// Styled form
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

// Styled form footer
const FormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

// Styled link
const StyledLink = styled(Link)`
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Login page component
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate form
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      
      // Attempt to login
      await login(username, password);
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      // Handle login error
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <LoginCard title="Login to Your Account">
        <Form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            required
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
          />
          
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          
          <FormFooter>
            <StyledLink to="/register">Don't have an account?</StyledLink>
            <Button type="submit" isLoading={loading}>Login</Button>
          </FormFooter>
        </Form>
      </LoginCard>
    </Container>
  );
};

export default LoginPage; 