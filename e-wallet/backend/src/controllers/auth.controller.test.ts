import { Request, Response, NextFunction } from 'express';
import { register, login, getProfile } from './auth.controller';
import { userModel, walletModel } from '../models';
import { generateToken } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

// Mock dependencies
jest.mock('../models', () => ({
  userModel: {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    verifyPassword: jest.fn(),
  },
  walletModel: {
    create: jest.fn(),
    findByUserId: jest.fn(),
  },
}));

jest.mock('../middleware/auth.middleware', () => ({
  generateToken: jest.fn(),
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      
      mockRequest.body = userData;
      
      const createdUser = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const createdWallet = {
        id: '456',
        userId: '123',
        balance: 0,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const token = 'generated-token';
      
      (userModel.findByUsername as jest.Mock).mockResolvedValue(null);
      (userModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue(createdUser);
      (walletModel.create as jest.Mock).mockResolvedValue(createdWallet);
      (generateToken as jest.Mock).mockReturnValue(token);
      
      // Act
      await register(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(userModel.findByUsername).toHaveBeenCalledWith(userData.username);
      expect(userModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userModel.create).toHaveBeenCalledWith(userData.username, userData.email, userData.password);
      expect(walletModel.create).toHaveBeenCalledWith(createdUser.id);
      expect(generateToken).toHaveBeenCalledWith(createdUser.id, createdUser.username);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should return error when username or email already exists', async () => {
      // Arrange
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };
      
      mockRequest.body = userData;
      
      const existingUser = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (userModel.findByUsername as jest.Mock).mockResolvedValue(existingUser);
      
      // Act
      await register(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(userModel.findByUsername).toHaveBeenCalledWith(userData.username);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(mockNext.mock.calls[0][0].message).toContain('already exists');
    });
  });
  
  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData = {
        username: 'testuser',
        password: 'password123',
      };
      
      mockRequest.body = loginData;
      
      const user = {
        id: '123',
        username: loginData.username,
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const token = 'generated-token';
      
      (userModel.findByUsername as jest.Mock).mockResolvedValue(user);
      (userModel.verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue(token);
      
      // Act
      await login(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(userModel.findByUsername).toHaveBeenCalledWith(loginData.username);
      expect(userModel.verifyPassword).toHaveBeenCalledWith(user, loginData.password);
      expect(generateToken).toHaveBeenCalledWith(user.id, user.username);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should return error when username is invalid', async () => {
      // Arrange
      const loginData = {
        username: 'nonexistentuser',
        password: 'password123',
      };
      
      mockRequest.body = loginData;
      
      (userModel.findByUsername as jest.Mock).mockResolvedValue(null);
      
      // Act
      await login(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(userModel.findByUsername).toHaveBeenCalledWith(loginData.username);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
    
    it('should return error when password is invalid', async () => {
      // Arrange
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      
      mockRequest.body = loginData;
      
      const user = {
        id: '123',
        username: loginData.username,
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (userModel.findByUsername as jest.Mock).mockResolvedValue(user);
      (userModel.verifyPassword as jest.Mock).mockResolvedValue(false);
      
      // Act
      await login(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(userModel.findByUsername).toHaveBeenCalledWith(loginData.username);
      expect(userModel.verifyPassword).toHaveBeenCalledWith(user, loginData.password);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });
}); 