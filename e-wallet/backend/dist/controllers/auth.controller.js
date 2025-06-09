"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const models_1 = require("../models");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const shared_1 = require("@e-wallet/shared");
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        // Check if the username or email already exists
        const existingUser = await models_1.userModel.findByUsername(username) || await models_1.userModel.findByEmail(email);
        if (existingUser) {
            throw new error_middleware_1.AppError('Username or email already exists', 400);
        }
        // Create the user
        const user = await models_1.userModel.create(username, email, password);
        // Create a wallet for the user
        const wallet = await models_1.walletModel.create(user.id);
        // Generate a JWT token
        const token = (0, auth_middleware_1.generateToken)(user.id, user.username);
        // Return the token and user info (exclude password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json((0, shared_1.formatApiResponse)(true, {
            token,
            user: userWithoutPassword,
            wallet
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // Find the user
        const user = await models_1.userModel.findByUsername(username);
        if (!user) {
            throw new error_middleware_1.AppError('Invalid username or password', 401);
        }
        // Verify the password
        const isValidPassword = await models_1.userModel.verifyPassword(user, password);
        if (!isValidPassword) {
            throw new error_middleware_1.AppError('Invalid username or password', 401);
        }
        // Generate a JWT token
        const token = (0, auth_middleware_1.generateToken)(user.id, user.username);
        // Return the token and user info (exclude password)
        const { password: _, ...userWithoutPassword } = user;
        res.json((0, shared_1.formatApiResponse)(true, {
            token,
            user: userWithoutPassword
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getProfile = async (req, res, next) => {
    try {
        // req.user is set by the authentication middleware
        if (!req.user) {
            throw new error_middleware_1.AppError('Not authenticated', 401);
        }
        // Get the user from the database
        const user = await models_1.userModel.findById(req.user.id);
        if (!user) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Get the user's wallets
        const wallets = await models_1.walletModel.findByUserId(user.id);
        // Return the user info (exclude password)
        const { password: _, ...userWithoutPassword } = user;
        res.json((0, shared_1.formatApiResponse)(true, {
            user: userWithoutPassword,
            wallets
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
