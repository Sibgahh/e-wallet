"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const db_1 = require("./db");
const shared_1 = require("@e-wallet/shared");
const wallet_model_1 = __importDefault(require("./wallet.model"));
class TransactionModel {
    /**
     * Create a new transaction
     * @param walletId Wallet ID
     * @param amount Transaction amount
     * @param type Transaction type
     * @param recipientWalletId Recipient wallet ID (for TRANSFER type)
     * @param description Optional transaction description
     * @returns The created transaction
     */
    async create(walletId, amount, type, recipientWalletId, description) {
        const connection = await db_1.pool.getConnection();
        try {
            // Validate the amount
            const validatedAmount = (0, shared_1.validateAmount)(amount);
            if (validatedAmount <= 0) {
                throw new Error('Transaction amount must be positive');
            }
            // Generate UUID for the transaction
            const id = (0, uuid_1.v4)();
            // Get current timestamp
            const now = new Date();
            // Set initial status to PENDING
            const status = 'PENDING';
            // Insert the transaction into the database
            await connection.execute('INSERT INTO transactions (id, wallet_id, amount, type, status, recipient_wallet_id, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, walletId, validatedAmount, type, status, recipientWalletId || null, description || null, now, now]);
            // Return the created transaction
            return {
                id,
                walletId,
                amount: validatedAmount,
                type,
                status,
                recipientWalletId,
                description,
                createdAt: now,
                updatedAt: now
            };
        }
        finally {
            connection.release();
        }
    }
    /**
     * Find a transaction by ID
     * @param id Transaction ID
     * @returns The transaction if found, null otherwise
     */
    async findById(id) {
        const connection = await db_1.pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM transactions WHERE id = ?', [id]);
            const transactions = rows;
            if (transactions.length === 0) {
                return null;
            }
            const transaction = transactions[0];
            return {
                id: transaction.id,
                walletId: transaction.wallet_id,
                amount: Number(transaction.amount),
                type: transaction.type,
                status: transaction.status,
                recipientWalletId: transaction.recipient_wallet_id || undefined,
                description: transaction.description || undefined,
                createdAt: new Date(transaction.created_at),
                updatedAt: new Date(transaction.updated_at)
            };
        }
        finally {
            connection.release();
        }
    }
    /**
     * Find all transactions for a wallet
     * @param walletId Wallet ID
     * @returns Array of transactions
     */
    async findByWalletId(walletId) {
        const connection = await db_1.pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM transactions WHERE wallet_id = ? OR recipient_wallet_id = ? ORDER BY created_at DESC', [walletId, walletId]);
            const transactions = rows;
            return transactions.map(transaction => ({
                id: transaction.id,
                walletId: transaction.wallet_id,
                amount: Number(transaction.amount),
                type: transaction.type,
                status: transaction.status,
                recipientWalletId: transaction.recipient_wallet_id || undefined,
                description: transaction.description || undefined,
                createdAt: new Date(transaction.created_at),
                updatedAt: new Date(transaction.updated_at)
            }));
        }
        finally {
            connection.release();
        }
    }
    /**
     * Process a transaction
     * @param id Transaction ID
     * @returns The processed transaction
     */
    async processTransaction(id) {
        const connection = await db_1.pool.getConnection();
        try {
            // Start a transaction
            await connection.beginTransaction();
            // Get the transaction
            const transaction = await this.findById(id);
            if (!transaction || transaction.status !== 'PENDING') {
                await connection.rollback();
                return null;
            }
            let success = false;
            // Process the transaction based on its type
            switch (transaction.type) {
                case 'DEPOSIT':
                    // Add funds to the wallet
                    await wallet_model_1.default.updateBalance(transaction.walletId, transaction.amount);
                    success = true;
                    break;
                case 'WITHDRAWAL':
                    try {
                        // Subtract funds from the wallet
                        await wallet_model_1.default.updateBalance(transaction.walletId, -transaction.amount);
                        success = true;
                    }
                    catch (error) {
                        success = false;
                    }
                    break;
                case 'TRANSFER':
                    if (!transaction.recipientWalletId) {
                        success = false;
                        break;
                    }
                    try {
                        // Transfer funds between wallets
                        await wallet_model_1.default.transfer(transaction.walletId, transaction.recipientWalletId, transaction.amount);
                        success = true;
                    }
                    catch (error) {
                        success = false;
                    }
                    break;
            }
            // Update the transaction status
            const newStatus = success ? 'COMPLETED' : 'FAILED';
            await connection.execute('UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?', [newStatus, new Date(), id]);
            // Commit the transaction
            await connection.commit();
            // Return the updated transaction
            return {
                ...transaction,
                status: newStatus,
                updatedAt: new Date()
            };
        }
        catch (error) {
            // Rollback the transaction on error
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
exports.default = new TransactionModel();
