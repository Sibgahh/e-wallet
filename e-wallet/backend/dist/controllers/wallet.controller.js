"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferByWalletNumber = exports.transferFunds = exports.withdrawFromWallet = exports.depositToWallet = exports.createWallet = exports.getUserWallets = exports.getWallet = void 0;
const models_1 = require("../models");
const error_middleware_1 = require("../middleware/error.middleware");
const shared_1 = require("@e-wallet/shared");
const getWallet = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if the wallet exists
        const wallet = await models_1.walletModel.findById(id);
        if (!wallet) {
            throw new error_middleware_1.AppError('Wallet not found', 404);
        }
        // Check if the wallet belongs to the authenticated user
        if (wallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to wallet', 403);
        }
        res.json((0, shared_1.formatApiResponse)(true, wallet));
    }
    catch (error) {
        next(error);
    }
};
exports.getWallet = getWallet;
const getUserWallets = async (req, res, next) => {
    try {
        // req.user is set by the authentication middleware
        if (!req.user) {
            throw new error_middleware_1.AppError('Not authenticated', 401);
        }
        // Get all wallets for the user
        const wallets = await models_1.walletModel.findByUserId(req.user.id);
        res.json((0, shared_1.formatApiResponse)(true, wallets));
    }
    catch (error) {
        next(error);
    }
};
exports.getUserWallets = getUserWallets;
const createWallet = async (req, res, next) => {
    try {
        // req.user is set by the authentication middleware
        if (!req.user) {
            throw new error_middleware_1.AppError('Not authenticated', 401);
        }
        const { currency } = req.body;
        // Create a new wallet for the user
        const wallet = await models_1.walletModel.create(req.user.id, currency);
        res.status(201).json((0, shared_1.formatApiResponse)(true, wallet));
    }
    catch (error) {
        next(error);
    }
};
exports.createWallet = createWallet;
const depositToWallet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        // Check if the wallet exists
        const wallet = await models_1.walletModel.findById(id);
        if (!wallet) {
            throw new error_middleware_1.AppError('Wallet not found', 404);
        }
        // Check if the wallet belongs to the authenticated user
        if (wallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to wallet', 403);
        }
        // Validate amount
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            throw new error_middleware_1.AppError('Invalid amount. Must be a positive number.', 400);
        }
        // Update the wallet balance
        const updatedWallet = await models_1.walletModel.updateBalance(id, amount);
        // Create transaction record
        await models_1.transactionModel.create(id, amount, 'DEPOSIT', undefined, 'Deposit to wallet');
        res.json((0, shared_1.formatApiResponse)(true, updatedWallet));
    }
    catch (error) {
        next(error);
    }
};
exports.depositToWallet = depositToWallet;
const withdrawFromWallet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        // Check if the wallet exists
        const wallet = await models_1.walletModel.findById(id);
        if (!wallet) {
            throw new error_middleware_1.AppError('Wallet not found', 404);
        }
        // Check if the wallet belongs to the authenticated user
        if (wallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to wallet', 403);
        }
        // Validate amount
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            throw new error_middleware_1.AppError('Invalid amount. Must be a positive number.', 400);
        }
        // Check if the wallet has sufficient funds
        if (wallet.balance < amount) {
            throw new error_middleware_1.AppError('Insufficient funds', 400);
        }
        // Update the wallet balance (negative amount for withdrawal)
        const updatedWallet = await models_1.walletModel.updateBalance(id, -amount);
        // Create transaction record
        await models_1.transactionModel.create(id, amount, 'WITHDRAWAL', undefined, 'Withdrawal from wallet');
        res.json((0, shared_1.formatApiResponse)(true, updatedWallet));
    }
    catch (error) {
        next(error);
    }
};
exports.withdrawFromWallet = withdrawFromWallet;
const transferFunds = async (req, res, next) => {
    try {
        const { fromWalletId, toWalletId, amount } = req.body;
        // Validate input
        if (!fromWalletId || !toWalletId || !amount) {
            throw new error_middleware_1.AppError('Missing required fields: fromWalletId, toWalletId, amount', 400);
        }
        // Check if the wallets exist
        const fromWallet = await models_1.walletModel.findById(fromWalletId);
        const toWallet = await models_1.walletModel.findById(toWalletId);
        if (!fromWallet || !toWallet) {
            throw new error_middleware_1.AppError('One or both wallets not found', 404);
        }
        // Check if the source wallet belongs to the authenticated user
        if (fromWallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to source wallet', 403);
        }
        // Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            throw new error_middleware_1.AppError('Invalid amount. Must be a positive number.', 400);
        }
        // Check if the source wallet has sufficient funds
        if (fromWallet.balance < amount) {
            throw new error_middleware_1.AppError('Insufficient funds', 400);
        }
        // Transfer funds between wallets
        const result = await models_1.walletModel.transfer(fromWalletId, toWalletId, amount);
        // Create transaction record for the sender
        await models_1.transactionModel.create(fromWalletId, amount, 'TRANSFER', toWalletId, `Transfer to wallet ${toWallet.walletNumber}`);
        res.json((0, shared_1.formatApiResponse)(true, result));
    }
    catch (error) {
        next(error);
    }
};
exports.transferFunds = transferFunds;
const transferByWalletNumber = async (req, res, next) => {
    try {
        const { fromWalletId, toWalletNumber, amount } = req.body;
        // Validate input
        if (!fromWalletId || !toWalletNumber || !amount) {
            throw new error_middleware_1.AppError('Missing required fields: fromWalletId, toWalletNumber, amount', 400);
        }
        // Check if the source wallet exists
        const fromWallet = await models_1.walletModel.findById(fromWalletId);
        if (!fromWallet) {
            throw new error_middleware_1.AppError('Source wallet not found', 404);
        }
        // Check if the source wallet belongs to the authenticated user
        if (fromWallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to source wallet', 403);
        }
        // Check if the destination wallet exists
        const toWallet = await models_1.walletModel.findByWalletNumber(toWalletNumber);
        if (!toWallet) {
            throw new error_middleware_1.AppError('Destination wallet not found. Please check the wallet number.', 404);
        }
        // Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            throw new error_middleware_1.AppError('Invalid amount. Must be a positive number.', 400);
        }
        // Check if the source wallet has sufficient funds
        if (fromWallet.balance < amount) {
            throw new error_middleware_1.AppError('Insufficient funds', 400);
        }
        // Transfer funds between wallets using wallet number
        const result = await models_1.walletModel.transferByWalletNumber(fromWalletId, toWalletNumber, amount);
        // Create transaction record for the sender
        await models_1.transactionModel.create(fromWalletId, amount, 'TRANSFER', toWallet.id, `Transfer to wallet ${toWalletNumber}`);
        res.json((0, shared_1.formatApiResponse)(true, result));
    }
    catch (error) {
        next(error);
    }
};
exports.transferByWalletNumber = transferByWalletNumber;
