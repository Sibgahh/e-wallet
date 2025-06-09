import { v4 as uuidv4 } from 'uuid';
import { pool } from './db';
import { Wallet } from '@e-wallet/shared';
import { validateCurrency, validateAmount } from '@e-wallet/shared';

class WalletModel {
  /**
   * Generate a unique wallet number
   * @returns Unique wallet number string
   */
  private async generateUniqueWalletNumber(): Promise<string> {
    const connection = await pool.getConnection();
    try {
      let walletNumber: string;
      let isUnique = false;
      
      while (!isUnique) {
        // Generate a 10-digit wallet number with EW prefix
        walletNumber = 'EW' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        
        // Check if this wallet number already exists
        const [rows] = await connection.execute(
          'SELECT id FROM wallets WHERE wallet_number = ?',
          [walletNumber]
        );
        
        isUnique = (rows as any[]).length === 0;
      }
      
      return walletNumber!;
    } finally {
      connection.release();
    }
  }

  /**
   * Create a new wallet for a user
   * @param userId User ID
   * @param currency Currency code (default: USD)
   * @returns The created wallet
   */  async create(userId: string, currency: string = 'USD'): Promise<Wallet> {
    const connection = await pool.getConnection();
    try {
      // Validate currency
      const validatedCurrency = validateCurrency(currency);
      
      // Generate UUID for the wallet
      const id = uuidv4();
      
      // Generate unique wallet number
      const walletNumber = await this.generateUniqueWalletNumber();
      
      // Get current timestamp
      const now = new Date();
      
      // Insert the wallet into the database
      await connection.execute(
        'INSERT INTO wallets (id, user_id, wallet_number, balance, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, userId, walletNumber, 0, validatedCurrency, now, now]
      );
      
      // Return the created wallet
      return {
        id,
        userId,
        walletNumber,
        balance: 0,
        currency: validatedCurrency,
        createdAt: now,
        updatedAt: now
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find a wallet by ID
   * @param id Wallet ID
   * @returns The wallet if found, null otherwise
   */
  async findById(id: string): Promise<Wallet | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM wallets WHERE id = ?',
        [id]
      );
      
      const wallets = rows as any[];
      
      if (wallets.length === 0) {
        return null;
      }
        const wallet = wallets[0];
      return {
        id: wallet.id,
        userId: wallet.user_id,
        walletNumber: wallet.wallet_number,
        balance: Number(wallet.balance),
        currency: wallet.currency,
        createdAt: new Date(wallet.created_at),
        updatedAt: new Date(wallet.updated_at)
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find all wallets for a user
   * @param userId User ID
   * @returns Array of wallets
   */
  async findByUserId(userId: string): Promise<Wallet[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM wallets WHERE user_id = ?',
        [userId]
      );
      
      const wallets = rows as any[];
        return wallets.map(wallet => ({
        id: wallet.id,
        userId: wallet.user_id,
        walletNumber: wallet.wallet_number,
        balance: Number(wallet.balance),
        currency: wallet.currency,
        createdAt: new Date(wallet.created_at),
        updatedAt: new Date(wallet.updated_at)
      }));    } finally {
      connection.release();
    }
  }

  /**
   * Find a wallet by wallet number
   * @param walletNumber Wallet number
   * @returns The wallet if found, null otherwise
   */
  async findByWalletNumber(walletNumber: string): Promise<Wallet | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM wallets WHERE wallet_number = ?',
        [walletNumber]
      );
      
      const wallets = rows as any[];
      
      if (wallets.length === 0) {
        return null;
      }
      
      const wallet = wallets[0];
      return {
        id: wallet.id,
        userId: wallet.user_id,
        walletNumber: wallet.wallet_number,
        balance: Number(wallet.balance),
        currency: wallet.currency,
        createdAt: new Date(wallet.created_at),
        updatedAt: new Date(wallet.updated_at)
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Update wallet balance
   * @param id Wallet ID
   * @param amount Amount to add (positive) or subtract (negative)
   * @returns The updated wallet
   */
  async updateBalance(id: string, amount: number): Promise<Wallet | null> {
    const connection = await pool.getConnection();
    try {
      // Start a transaction
      await connection.beginTransaction();
      
      // Get the current wallet
      const wallet = await this.findById(id);
      if (!wallet) {
        await connection.rollback();
        return null;      }
      
      // Validate the amount (allow negative amounts for withdrawals)
      if (isNaN(amount)) {
        await connection.rollback();
        throw new Error('Invalid amount. Must be a number.');
      }
      
      // Convert to 2 decimal places
      const validatedAmount = Math.round(amount * 100) / 100;
      
      // Calculate new balance
      const newBalance = wallet.balance + validatedAmount;
      
      // Ensure balance doesn't go negative
      if (newBalance < 0) {
        await connection.rollback();
        throw new Error('Insufficient funds');
      }
      
      // Update the wallet
      await connection.execute(
        'UPDATE wallets SET balance = ? WHERE id = ?',
        [newBalance, id]
      );
      
      // Commit the transaction
      await connection.commit();
      
      // Return the updated wallet
      return {
        ...wallet,
        balance: newBalance,
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
  
  /**
   * Transfer funds between wallets
   * @param fromWalletId Source wallet ID
   * @param toWalletId Destination wallet ID
   * @param amount Amount to transfer
   * @returns Object with both updated wallets
   */
  async transfer(fromWalletId: string, toWalletId: string, amount: number): Promise<{ from: Wallet, to: Wallet }> {
    const connection = await pool.getConnection();
    try {
      // Start a transaction
      await connection.beginTransaction();
      
      // Get both wallets
      const fromWallet = await this.findById(fromWalletId);
      const toWallet = await this.findById(toWalletId);
      
      if (!fromWallet || !toWallet) {
        await connection.rollback();
        throw new Error('One or both wallets not found');
      }
      
      // Validate the amount
      const validatedAmount = validateAmount(amount);
      if (validatedAmount <= 0) {
        await connection.rollback();
        throw new Error('Transfer amount must be positive');
      }
      
      // Check if source wallet has sufficient funds
      if (fromWallet.balance < validatedAmount) {
        await connection.rollback();
        throw new Error('Insufficient funds');
      }
      
      // Update source wallet (subtract amount)
      await connection.execute(
        'UPDATE wallets SET balance = balance - ? WHERE id = ?',
        [validatedAmount, fromWalletId]
      );
      
      // Update destination wallet (add amount)
      await connection.execute(
        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        [validatedAmount, toWalletId]
      );
      
      // Commit the transaction
      await connection.commit();
      
      // Return updated wallets
      const updatedFromWallet = {
        ...fromWallet,
        balance: fromWallet.balance - validatedAmount,
        updatedAt: new Date()
      };
      
      const updatedToWallet = {
        ...toWallet,
        balance: toWallet.balance + validatedAmount,
        updatedAt: new Date()
      };
      
      return {
        from: updatedFromWallet,
        to: updatedToWallet
      };
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      throw error;    } finally {
      connection.release();
    }
  }

  /**
   * Transfer funds between wallets using wallet numbers
   * @param fromWalletId Source wallet ID
   * @param toWalletNumber Destination wallet number
   * @param amount Amount to transfer
   * @returns Object with both updated wallets
   */
  async transferByWalletNumber(fromWalletId: string, toWalletNumber: string, amount: number): Promise<{ from: Wallet, to: Wallet }> {
    const connection = await pool.getConnection();
    try {
      // Start a transaction
      await connection.beginTransaction();
      
      // Get both wallets
      const fromWallet = await this.findById(fromWalletId);
      const toWallet = await this.findByWalletNumber(toWalletNumber);
      
      if (!fromWallet || !toWallet) {
        await connection.rollback();
        throw new Error('Source wallet or destination wallet not found');
      }
      
      // Validate the amount
      const validatedAmount = validateAmount(amount);
      if (validatedAmount <= 0) {
        await connection.rollback();
        throw new Error('Transfer amount must be positive');
      }
      
      // Check if source wallet has sufficient funds
      if (fromWallet.balance < validatedAmount) {
        await connection.rollback();
        throw new Error('Insufficient funds');
      }
      
      // Update source wallet (subtract amount)
      await connection.execute(
        'UPDATE wallets SET balance = balance - ? WHERE id = ?',
        [validatedAmount, fromWalletId]
      );
      
      // Update destination wallet (add amount)
      await connection.execute(
        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        [validatedAmount, toWallet.id]
      );
      
      // Commit the transaction
      await connection.commit();
      
      // Return updated wallets
      const updatedFromWallet = {
        ...fromWallet,
        balance: fromWallet.balance - validatedAmount,
        updatedAt: new Date()
      };
      
      const updatedToWallet = {
        ...toWallet,
        balance: toWallet.balance + validatedAmount,
        updatedAt: new Date()
      };
      
      return {
        from: updatedFromWallet,
        to: updatedToWallet
      };
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a wallet
   * @param id Wallet ID
   * @returns True if the wallet was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM wallets WHERE id = ?',
        [id]
      ) as any;
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new WalletModel(); 