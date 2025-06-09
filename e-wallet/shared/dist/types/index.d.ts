import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const WalletSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    walletNumber: z.ZodString;
    balance: z.ZodNumber;
    currency: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    walletNumber: string;
    balance: number;
    currency: string;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    walletNumber: string;
    balance: number;
    currency: string;
}>;
export type Wallet = z.infer<typeof WalletSchema>;
export declare const TransactionTypeEnum: z.ZodEnum<["DEPOSIT", "WITHDRAWAL", "TRANSFER"]>;
export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export declare const TransactionStatusEnum: z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>;
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    walletId: z.ZodString;
    amount: z.ZodNumber;
    type: z.ZodEnum<["DEPOSIT", "WITHDRAWAL", "TRANSFER"]>;
    status: z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>;
    recipientWalletId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
    status: "PENDING" | "COMPLETED" | "FAILED";
    walletId: string;
    amount: number;
    recipientWalletId?: string | undefined;
    description?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
    status: "PENDING" | "COMPLETED" | "FAILED";
    walletId: string;
    amount: number;
    recipientWalletId?: string | undefined;
    description?: string | undefined;
}>;
export type Transaction = z.infer<typeof TransactionSchema>;
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
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
export interface CreateTransactionRequest {
    amount: number;
    type: TransactionType;
    recipientWalletId?: string;
    description?: string;
}
