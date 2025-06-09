import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, RegisterRequest, User, Wallet, Transaction, TransactionType } from '@e-wallet/shared';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define API service class
class ApiService {
  // Auth endpoints
  
  /**
   * Register a new user
   * @param data User registration data
   * @returns API response with token and user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<{ token: string; user: User; wallet: Wallet }>> {
    const response: AxiosResponse<ApiResponse<{ token: string; user: User; wallet: Wallet }>> = 
      await api.post('/auth/register', data);
    
    // Store token in localStorage
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  }
  
  /**
   * Login user
   * @param data User login data
   * @returns API response with token and user
   */
  async login(data: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> {
    const response: AxiosResponse<ApiResponse<{ token: string; user: User }>> = 
      await api.post('/auth/login', data);
    
    // Store token in localStorage
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  }
  
  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
  }
  
  /**
   * Get user profile
   * @returns API response with user and wallets
   */
  async getProfile(): Promise<ApiResponse<{ user: User; wallets: Wallet[] }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; wallets: Wallet[] }>> = 
      await api.get('/auth/profile');
    return response.data;
  }
  
  // Wallet endpoints
  
  /**
   * Get all wallets for current user
   * @returns API response with wallets
   */
  async getWallets(): Promise<ApiResponse<Wallet[]>> {
    const response: AxiosResponse<ApiResponse<Wallet[]>> = 
      await api.get('/wallets');
    return response.data;
  }
  
  /**
   * Get wallet by ID
   * @param id Wallet ID
   * @returns API response with wallet
   */
  async getWallet(id: string): Promise<ApiResponse<Wallet>> {
    const response: AxiosResponse<ApiResponse<Wallet>> = 
      await api.get(`/wallets/${id}`);
    return response.data;
  }
  
  /**
   * Create a new wallet
   * @param currency Currency code (default: USD)
   * @returns API response with created wallet
   */
  async createWallet(currency?: string): Promise<ApiResponse<Wallet>> {
    const response: AxiosResponse<ApiResponse<Wallet>> = 
      await api.post('/wallets', { currency });
    return response.data;
  }
  
  /**
   * Deposit funds to wallet
   * @param walletId Wallet ID
   * @param amount Amount to deposit
   * @returns API response with updated wallet
   */
  async deposit(walletId: string, amount: number): Promise<ApiResponse<Wallet>> {
    const response: AxiosResponse<ApiResponse<Wallet>> = 
      await api.post(`/wallets/${walletId}/deposit`, { amount });
    return response.data;
  }
  
  /**
   * Withdraw funds from wallet
   * @param walletId Wallet ID
   * @param amount Amount to withdraw
   * @returns API response with updated wallet
   */
  async withdraw(walletId: string, amount: number): Promise<ApiResponse<Wallet>> {
    const response: AxiosResponse<ApiResponse<Wallet>> = 
      await api.post(`/wallets/${walletId}/withdraw`, { amount });
    return response.data;
  }
  
  /**
   * Transfer funds between wallets
   * @param fromWalletId Source wallet ID
   * @param toWalletId Destination wallet ID
   * @param amount Amount to transfer
   * @returns API response with updated wallets
   */
  async transfer(fromWalletId: string, toWalletId: string, amount: number): Promise<ApiResponse<{ from: Wallet; to: Wallet }>> {
    const response: AxiosResponse<ApiResponse<{ from: Wallet; to: Wallet }>> = 
      await api.post('/wallets/transfer', { fromWalletId, toWalletId, amount });
    return response.data;
  }
  
  /**
   * Transfer funds to a wallet using wallet number
   * @param fromWalletId Source wallet ID
   * @param toWalletNumber Destination wallet number
   * @param amount Amount to transfer
   * @returns API response with updated wallets
   */
  async transferByWalletNumber(fromWalletId: string, toWalletNumber: string, amount: number): Promise<ApiResponse<{ from: Wallet; to: Wallet }>> {
    const response: AxiosResponse<ApiResponse<{ from: Wallet; to: Wallet }>> = 
      await api.post('/wallets/transfer-by-number', { fromWalletId, toWalletNumber, amount });
    return response.data;
  }
  
  // Transaction endpoints
  
  /**
   * Get all transactions for a wallet
   * @param walletId Wallet ID
   * @returns API response with transactions
   */
  async getWalletTransactions(walletId: string): Promise<ApiResponse<Transaction[]>> {
    const response: AxiosResponse<ApiResponse<Transaction[]>> = 
      await api.get(`/transactions/wallet/${walletId}`);
    return response.data;
  }
  
  /**
   * Get transaction by ID
   * @param id Transaction ID
   * @returns API response with transaction
   */
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    const response: AxiosResponse<ApiResponse<Transaction>> = 
      await api.get(`/transactions/${id}`);
    return response.data;
  }
  
  /**
   * Create a transaction
   * @param walletId Wallet ID
   * @param amount Transaction amount
   * @param type Transaction type
   * @param recipientWalletId Recipient wallet ID (for TRANSFER type)
   * @param description Transaction description
   * @returns API response with created transaction
   */
  async createTransaction(
    walletId: string,
    amount: number,
    type: TransactionType,
    recipientWalletId?: string,
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    const response: AxiosResponse<ApiResponse<Transaction>> = 
      await api.post('/transactions', {
        walletId,
        amount,
        type,
        recipientWalletId,
        description
      });
    return response.data;
  }
}

// Export singleton instance
export default new ApiService();