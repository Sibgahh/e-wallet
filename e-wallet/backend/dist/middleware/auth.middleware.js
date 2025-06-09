"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const models_1 = require("../models");
/**
 * Authentication middleware to verify the JWT token
 */
const authenticateToken = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.server.jwtSecret);
        // Find the user in the database
        const user = await models_1.userModel.findById(decoded.id);
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
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Helper function to generate a JWT token
 */
const generateToken = (id, username) => {
    // @ts-ignore - Ignoring type error for jwt.sign
    return jsonwebtoken_1.default.sign({ id, username }, config_1.default.server.jwtSecret, { expiresIn: '1d' });
};
exports.generateToken = generateToken;
