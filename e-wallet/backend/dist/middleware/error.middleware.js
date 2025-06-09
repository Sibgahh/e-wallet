"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = exports.AppError = void 0;
// Custom error class
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Not found error handler - when no route matches
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
// Global error handler
const errorHandler = (err, req, res, next) => {
    // Default status code
    const statusCode = 'statusCode' in err ? err.statusCode : 500;
    // Log the error for debugging
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};
exports.errorHandler = errorHandler;
