import { Request, Response, NextFunction } from 'express';
import { userModel, walletModel } from '../models';
import { generateToken } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { validateSchema } from '@e-wallet/shared';
import { UserSchema } from '@e-wallet/shared';
import { formatApiResponse } from '@e-wallet/shared';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if the username or email already exists
    const existingUser = await userModel.findByUsername(username) || await userModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }
    
    // Create the user
    const user = await userModel.create(username, email, password);
    
    // Create a wallet for the user
    const wallet = await walletModel.create(user.id);
    
    // Generate a JWT token
    const token = generateToken(user.id, user.username);
    
    // Return the token and user info (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(formatApiResponse(true, {
      token,
      user: userWithoutPassword,
      wallet
    }));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    
    // Find the user
    const user = await userModel.findByUsername(username);
    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }
    
    // Verify the password
    const isValidPassword = await userModel.verifyPassword(user, password);
    if (!isValidPassword) {
      throw new AppError('Invalid username or password', 401);
    }
    
    // Generate a JWT token
    const token = generateToken(user.id, user.username);
    
    // Return the token and user info (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(formatApiResponse(true, {
      token,
      user: userWithoutPassword
    }));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is set by the authentication middleware
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    // Get the user from the database
    const user = await userModel.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get the user's wallets
    const wallets = await walletModel.findByUserId(user.id);
    
    // Return the user info (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(formatApiResponse(true, {
      user: userWithoutPassword,
      wallets
    }));
  } catch (error) {
    next(error);
  }
}; 