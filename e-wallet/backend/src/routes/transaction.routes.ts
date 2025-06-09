import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All transaction routes are protected
router.use(authenticateToken);

// Get a specific transaction
router.get('/:id', transactionController.getTransaction);

// Get all transactions for a wallet
router.get('/wallet/:walletId', transactionController.getWalletTransactions);

// Create a new transaction
router.post('/', transactionController.createTransaction);

export default router; 