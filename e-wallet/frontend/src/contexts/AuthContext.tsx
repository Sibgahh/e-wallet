import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Wallet } from '@e-wallet/shared';
import apiService from '../services/api';

// Define context types
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  wallets: Wallet[];
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
            setWallets(response.data.wallets);
            setIsAuthenticated(true);
          } else {
            // Clear invalid token
            localStorage.removeItem('token');
          }
        } catch (error) {
          // Handle auth error
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login user
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login({ username, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        await refreshProfile();
        setIsAuthenticated(true);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiService.register({ username, email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setWallets([response.data.wallet]);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    apiService.logout();
    setUser(null);
    setWallets([]);
    setIsAuthenticated(false);
  };

  // Refresh user profile
  const refreshProfile = async () => {
    try {
      const response = await apiService.getProfile();
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setWallets(response.data.wallets);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  // Create context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    wallets,
    login,
    register,
    logout,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 