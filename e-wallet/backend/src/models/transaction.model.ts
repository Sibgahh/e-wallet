import { v4 as uuidv4 } from 'uuid';
import { pool } from './db';
import { Transaction, TransactionType, TransactionStatus } from '@e-wallet/shared';
import { validateAmount } from '@e-wallet/shared';
import walletModel from './wallet.model';

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
  async create(
    walletId: string,
    amount: number,
    type: TransactionType,
    recipientWalletId?: string,
    description?: string
  ): Promise<Transaction> {
    const connection = await pool.getConnection();
    try {
      // Validate the amount
      const validatedAmount = validateAmount(amount);
      if (validatedAmount <= 0) {
        throw new Error('Transaction amount must be positive');
      }
      
      // Generate UUID for the transaction
      const id = uuidv4();
      
      // Get current timestamp
      const now = new Date();
      
      // Set initial status to PENDING
      const status: TransactionStatus = 'PENDING';
      
      // Insert the transaction into the database
      await connection.execute(
        'INSERT INTO transactions (id, wallet_id, amount, type, status, recipient_wallet_id, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, walletId, validatedAmount, type, status, recipientWalletId || null, description || null, now, now]
      );
      
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
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find a transaction by ID
   * @param id Transaction ID
   * @returns The transaction if found, null otherwise
   */
  async findById(id: string): Promise<Transaction | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );
      
      const transactions = rows as any[];
      
      if (transactions.length === 0) {
        return null;
      }
      
      const transaction = transactions[0];
      return {
        id: transaction.id,
        walletId: transaction.wallet_id,
        amount: Number(transaction.amount),
        type: transaction.type as TransactionType,
        status: transaction.status as TransactionStatus,
        recipientWalletId: transaction.recipient_wallet_id || undefined,
        description: transaction.description || undefined,
        createdAt: new Date(transaction.created_at),
        updatedAt: new Date(transaction.updated_at)
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find all transactions for a wallet
   * @param walletId Wallet ID
   * @returns Array of transactions
   */
  async findByWalletId(walletId: string): Promise<Transaction[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE wallet_id = ? OR recipient_wallet_id = ? ORDER BY created_at DESC',
        [walletId, walletId]
      );
      
      const transactions = rows as any[];
      
      return transactions.map(transaction => ({
        id: transaction.id,
        walletId: transaction.wallet_id,
        amount: Number(transaction.amount),
        type: transaction.type as TransactionType,
        status: transaction.status as TransactionStatus,
        recipientWalletId: transaction.recipient_wallet_id || undefined,
        description: transaction.description || undefined,
        createdAt: new Date(transaction.created_at),
        updatedAt: new Date(transaction.updated_at)
      }));
    } finally {
      connection.release();
    }
  }
  
  /**
   * Process a transaction
   * @param id Transaction ID
   * @returns The processed transaction
   */
  async processTransaction(id: string): Promise<Transaction | null> {
    const connection = await pool.getConnection();
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
          await walletModel.updateBalance(transaction.walletId, transaction.amount);
          success = true;
          break;
          
        case 'WITHDRAWAL':
          try {
            // Subtract funds from the wallet
            await walletModel.updateBalance(transaction.walletId, -transaction.amount);
            success = true;
          } catch (error) {
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
            await walletModel.transfer(
              transaction.walletId,
              transaction.recipientWalletId,
              transaction.amount
            );
            success = true;
          } catch (error) {
            success = false;
          }
          break;
      }
      
      // Update the transaction status
      const newStatus: TransactionStatus = success ? 'COMPLETED' : 'FAILED';
      await connection.execute(
        'UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?',
        [newStatus, new Date(), id]
      );
      
      // Commit the transaction
      await connection.commit();
      
      // Return the updated transaction
      return {
        ...transaction,
        status: newStatus,
        updatedAt: new Date()
      };
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new TransactionModel(); 