import { Request, Response, NextFunction } from 'express';
import { walletModel, transactionModel } from '../models';
import { AppError } from '../middleware/error.middleware';
import { formatApiResponse } from '@e-wallet/shared';

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if the wallet exists
    const wallet = await walletModel.findById(id);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    
    // Check if the wallet belongs to the authenticated user
    if (wallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to wallet', 403);
    }
    
    res.json(formatApiResponse(true, wallet));
  } catch (error) {
    next(error);
  }
};

export const getUserWallets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is set by the authentication middleware
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    // Get all wallets for the user
    const wallets = await walletModel.findByUserId(req.user.id);
    
    res.json(formatApiResponse(true, wallets));
  } catch (error) {
    next(error);
  }
};

export const createWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is set by the authentication middleware
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const { currency } = req.body;
    
    // Create a new wallet for the user
    const wallet = await walletModel.create(req.user.id, currency);
    
    res.status(201).json(formatApiResponse(true, wallet));
  } catch (error) {
    next(error);
  }
};

export const depositToWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    // Check if the wallet exists
    const wallet = await walletModel.findById(id);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    
    // Check if the wallet belongs to the authenticated user
    if (wallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to wallet', 403);
    }
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid amount. Must be a positive number.', 400);
    }
      // Update the wallet balance
    const updatedWallet = await walletModel.updateBalance(id, amount);
    
    // Create transaction record
    await transactionModel.create(
      id,
      amount,
      'DEPOSIT',
      undefined,
      'Deposit to wallet'
    );

    res.json(formatApiResponse(true, updatedWallet));
  } catch (error) {
    next(error);
  }
};

export const withdrawFromWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    // Check if the wallet exists
    const wallet = await walletModel.findById(id);
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
    
    // Check if the wallet belongs to the authenticated user
    if (wallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to wallet', 403);
    }
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid amount. Must be a positive number.', 400);
    }
    
    // Check if the wallet has sufficient funds
    if (wallet.balance < amount) {
      throw new AppError('Insufficient funds', 400);
    }
      // Update the wallet balance (negative amount for withdrawal)
    const updatedWallet = await walletModel.updateBalance(id, -amount);
    
    // Create transaction record
    await transactionModel.create(
      id,
      amount,
      'WITHDRAWAL',
      undefined,
      'Withdrawal from wallet'
    );

    res.json(formatApiResponse(true, updatedWallet));
  } catch (error) {
    next(error);
  }
};

export const transferFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromWalletId, toWalletId, amount } = req.body;
    
    // Validate input
    if (!fromWalletId || !toWalletId || !amount) {
      throw new AppError('Missing required fields: fromWalletId, toWalletId, amount', 400);
    }
    
    // Check if the wallets exist
    const fromWallet = await walletModel.findById(fromWalletId);
    const toWallet = await walletModel.findById(toWalletId);
    
    if (!fromWallet || !toWallet) {
      throw new AppError('One or both wallets not found', 404);
    }
    
    // Check if the source wallet belongs to the authenticated user
    if (fromWallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to source wallet', 403);
    }
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid amount. Must be a positive number.', 400);
    }
    
    // Check if the source wallet has sufficient funds
    if (fromWallet.balance < amount) {
      throw new AppError('Insufficient funds', 400);
    }
      // Transfer funds between wallets
    const result = await walletModel.transfer(fromWalletId, toWalletId, amount);
    
    // Create transaction record for the sender
    await transactionModel.create(
      fromWalletId,
      amount,
      'TRANSFER',
      toWalletId,
      `Transfer to wallet ${toWallet.walletNumber}`
    );
    
    res.json(formatApiResponse(true, result));
  } catch (error) {
    next(error);
  }
};

export const transferByWalletNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromWalletId, toWalletNumber, amount } = req.body;
    
    // Validate input
    if (!fromWalletId || !toWalletNumber || !amount) {
      throw new AppError('Missing required fields: fromWalletId, toWalletNumber, amount', 400);
    }
    
    // Check if the source wallet exists
    const fromWallet = await walletModel.findById(fromWalletId);
    if (!fromWallet) {
      throw new AppError('Source wallet not found', 404);
    }
    
    // Check if the source wallet belongs to the authenticated user
    if (fromWallet.userId !== req.user?.id) {
      throw new AppError('Unauthorized access to source wallet', 403);
    }
    
    // Check if the destination wallet exists
    const toWallet = await walletModel.findByWalletNumber(toWalletNumber);
    if (!toWallet) {
      throw new AppError('Destination wallet not found. Please check the wallet number.', 404);
    }
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid amount. Must be a positive number.', 400);
    }
    
    // Check if the source wallet has sufficient funds
    if (fromWallet.balance < amount) {
      throw new AppError('Insufficient funds', 400);
    }
      // Transfer funds between wallets using wallet number
    const result = await walletModel.transferByWalletNumber(fromWalletId, toWalletNumber, amount);
    
    // Create transaction record for the sender
    await transactionModel.create(
      fromWalletId,
      amount,
      'TRANSFER',
      toWallet.id,
      `Transfer to wallet ${toWalletNumber}`
    );
    
    res.json(formatApiResponse(true, result));
  } catch (error) {
    next(error);
  }
};