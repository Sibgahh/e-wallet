import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

// Header container
const HeaderContainer = styled.header`
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Logo/Brand section
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
  cursor: pointer;
`;

// Navigation section
const Navigation = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  &.active {
    background-color: #dbeafe;
    color: #3b82f6;
  }
`;

// User info section
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #374151;
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return window.location.pathname === path;
  };

  return (
    <HeaderContainer>
      <Brand>
        <Logo onClick={() => navigate('/dashboard')}>
          💳 E-Wallet
        </Logo>
      </Brand>

      <Navigation>
        <NavButton
          className={isActive('/dashboard') ? 'active' : ''}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </NavButton>
        <NavButton
          className={isActive('/transactions') ? 'active' : ''}
          onClick={() => navigate('/transactions')}
        >
          Transactions
        </NavButton>
      </Navigation>

      <UserInfo>
        <UserName>
          Hello, {user?.username || 'User'}
        </UserName>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </UserInfo>
    </HeaderContainer>
  );
};

export default Header;
