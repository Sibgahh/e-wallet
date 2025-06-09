import { Request, Response, NextFunction } from 'express';
import { transactionModel, walletModel } from '../models';
import { AppError } from '../middleware/error.middleware';
import { formatApiResponse } from '@e-wallet/shared';
import { TransactionType } from '@e-wallet/shared';

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get the transaction
    const transaction = await transactionModel.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    
    // Get the wallet for authorization check
    const wallet = await walletModel.findById(transaction.walletId);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    
    // Check if the wallet belongs to the authenticated user
    if (wallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to transaction', 403);
    }
    
    res.json(formatApiResponse(true, transaction));
  } catch (error) {
    next(error);
  }
};

export const getWalletTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletId } = req.params;
    
    // Check if the wallet exists
    const wallet = await walletModel.findById(walletId);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    
    // Check if the wallet belongs to the authenticated user
    if (wallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to wallet transactions', 403);
    }
    
    // Get all transactions for the wallet
    const transactions = await transactionModel.findByWalletId(walletId);
    
    res.json(formatApiResponse(true, transactions));
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletId, amount, type, recipientWalletId, description } = req.body;
    
    // Validate input
    if (!walletId || !amount || !type) {
      throw new AppError('Missing required fields: walletId, amount, type', 400);
    }
    
    // Check if the wallet exists
    const wallet = await walletModel.findById(walletId);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    
    // Check if the wallet belongs to the authenticated user
    if (wallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to wallet', 403);
    }
    
    // Validate transaction type
    if (!['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'].includes(type)) {
      throw new AppError('Invalid transaction type. Must be DEPOSIT, WITHDRAWAL, or TRANSFER.', 400);
    }
    
    // For TRANSFER type, recipient wallet is required
    if (type === 'TRANSFER' && !recipientWalletId) {
      throw new AppError('Recipient wallet ID is required for TRANSFER transactions', 400);
    }
    
    // If recipient wallet is provided, check if it exists
    if (recipientWalletId) {
      const recipientWallet = await walletModel.findById(recipientWalletId);
      if (!recipientWallet) {
        throw new AppError('Recipient wallet not found', 404);
      }
    }
    
    // Create the transaction
    const transaction = await transactionModel.create(
      walletId,
      amount,
      type as TransactionType,
      recipientWalletId,
      description
    );
    
    // Process the transaction
    const processedTransaction = await transactionModel.processTransaction(transaction.id);
    
    res.status(201).json(formatApiResponse(true, processedTransaction));
  } catch (error) {
    next(error);
  }
}; 