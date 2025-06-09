"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSchema = exports.TransactionStatusEnum = exports.TransactionTypeEnum = exports.WalletSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
// User Schema
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8), // This would be hashed in actual implementation
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Wallet Schema
exports.WalletSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    walletNumber: zod_1.z.string().min(10).max(20),
    balance: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Transaction Schema
exports.TransactionTypeEnum = zod_1.z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']);
exports.TransactionStatusEnum = zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']);
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    walletId: zod_1.z.string().uuid(),
    amount: zod_1.z.number(),
    type: exports.TransactionTypeEnum,
    status: exports.TransactionStatusEnum,
    recipientWalletId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
