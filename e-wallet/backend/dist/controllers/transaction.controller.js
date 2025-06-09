"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = exports.getWalletTransactions = exports.getTransaction = void 0;
const models_1 = require("../models");
const error_middleware_1 = require("../middleware/error.middleware");
const shared_1 = require("@e-wallet/shared");
const getTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Get the transaction
        const transaction = await models_1.transactionModel.findById(id);
        if (!transaction) {
            throw new error_middleware_1.AppError('Transaction not found', 404);
        }
        // Get the wallet for authorization check
        const wallet = await models_1.walletModel.findById(transaction.walletId);
        if (!wallet) {
            throw new error_middleware_1.AppError('Wallet not found', 404);
        }
        // Check if the wallet belongs to the authenticated user
        if (wallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to transaction', 403);
        }
        res.json((0, shared_1.formatApiResponse)(true, transaction));
    }
    catch (error) {
        next(error);
    }
};
exports.getTransaction = getTransaction;
const getWalletTransactions = async (req, res, next) => {
    try {
        const { walletId } = req.params;
        // Check if the wallet exists
        const wallet = await models_1.walletModel.findById(walletId);
        if (!wallet) {
            throw new error_middleware_1.AppError('Wallet not found', 404);
        }
        // Check if the wallet belongs to the authenticated user
        if (wallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to wallet transactions', 403);
        }
        // Get all transactions for the wallet
        const transactions = await models_1.transactionModel.findByWalletId(walletId);
        res.json((0, shared_1.formatApiResponse)(true, transactions));
    }
    catch (error) {
        next(error);
    }
};
exports.getWalletTransactions = getWalletTransactions;
const createTransaction = async (req, res, next) => {
    try {
        const { walletId, amount, type, recipientWalletId, description } = req.body;
        // Validate input
        if (!walletId || !amount || !type) {
            throw new error_middleware_1.AppError('Missing required fields: walletId, amount, type', 400);
        }
        // Check if the wallet exists
        const wallet = await models_1.walletModel.findById(walletId);
        if (!wallet) {
            throw new error_middleware_1.AppError('Wallet not found', 404);
        }
        // Check if the wallet belongs to the authenticated user
        if (wallet.userId !== req.user?.id) {
            throw new error_middleware_1.AppError('Unauthorized access to wallet', 403);
        }
        // Validate transaction type
        if (!['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'].includes(type)) {
            throw new error_middleware_1.AppError('Invalid transaction type. Must be DEPOSIT, WITHDRAWAL, or TRANSFER.', 400);
        }
        // For TRANSFER type, recipient wallet is required
        if (type === 'TRANSFER' && !recipientWalletId) {
            throw new error_middleware_1.AppError('Recipient wallet ID is required for TRANSFER transactions', 400);
        }
        // If recipient wallet is provided, check if it exists
        if (recipientWalletId) {
            const recipientWallet = await models_1.walletModel.findById(recipientWalletId);
            if (!recipientWallet) {
                throw new error_middleware_1.AppError('Recipient wallet not found', 404);
            }
        }
        // Create the transaction
        const transaction = await models_1.transactionModel.create(walletId, amount, type, recipientWalletId, description);
        // Process the transaction
        const processedTransaction = await models_1.transactionModel.processTransaction(transaction.id);
        res.status(201).json((0, shared_1.formatApiResponse)(true, processedTransaction));
    }
    catch (error) {
        next(error);
    }
};
exports.createTransaction = createTransaction;
