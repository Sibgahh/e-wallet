import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { userModel } from '../models';

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

/**
 * Authentication middleware to verify the JWT token
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, config.server.jwtSecret) as { id: string; username: string };
    
    // Find the user in the database
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }
    
    // Set the user information on the request object
    req.user = {
      id: user.id,
      username: user.username
    };
    
    // Continue to the next middleware
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Helper function to generate a JWT token
 */
export const generateToken = (id: string, username: string): string => {
  // @ts-ignore - Ignoring type error for jwt.sign
  return jwt.sign(
    { id, username },
    config.server.jwtSecret,
    { expiresIn: '1d' }
  );
}; 