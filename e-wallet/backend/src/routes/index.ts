import { Router } from 'express';
import authRoutes from './auth.routes';
import walletRoutes from './wallet.routes';
import transactionRoutes from './transaction.routes';

const router = Router();

// Define API routes
router.use('/auth', authRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);

export default router; 