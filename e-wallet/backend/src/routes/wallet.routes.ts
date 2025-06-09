import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All wallet routes are protected
router.use(authenticateToken);

// Get all user wallets
router.get('/', walletController.getUserWallets);

// Create a new wallet
router.post('/', walletController.createWallet);

// Get a specific wallet
router.get('/:id', walletController.getWallet);

// Deposit funds
router.post('/:id/deposit', walletController.depositToWallet);

// Withdraw funds
router.post('/:id/withdraw', walletController.withdrawFromWallet);

// Transfer funds
router.post('/transfer', walletController.transferFunds);

// Transfer funds by wallet number
router.post('/transfer-by-number', walletController.transferByWalletNumber);

export default router; 