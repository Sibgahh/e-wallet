import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8), // This would be hashed in actual implementation
  createdAt: z.date(),
  updatedAt: z.date()
});

export type User = z.infer<typeof UserSchema>;

// Wallet Schema
export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  walletNumber: z.string().min(10).max(20),
  balance: z.number().min(0),
  currency: z.string().length(3),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Wallet = z.infer<typeof WalletSchema>;

// Transaction Schema
export const TransactionTypeEnum = z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionStatusEnum = z.enum(['PENDING', 'COMPLETED', 'FAILED']);
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  walletId: z.string().uuid(),
  amount: z.number(),
  type: TransactionTypeEnum,
  status: TransactionStatusEnum,
  recipientWalletId: z.string().uuid().optional(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Transaction = z.infer<typeof TransactionSchema>;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Transaction Types
export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  recipientWalletId?: string;
  description?: string;
} 