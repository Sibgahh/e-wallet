"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.initializeDatabase = initializeDatabase;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = __importDefault(require("../config"));
// Create a connection pool
const pool = promise_1.default.createPool({
    host: config_1.default.db.host,
    port: config_1.default.db.port,
    user: config_1.default.db.user,
    password: config_1.default.db.password,
    database: config_1.default.db.database,
    connectionLimit: config_1.default.db.connectionLimit,
    waitForConnections: true
});
exports.pool = pool;
// Test the database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established successfully');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
// Initialize database tables
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        // Create users table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        // Create wallets table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS wallets (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        balance DECIMAL(19, 4) NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        // Create transactions table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        wallet_id VARCHAR(36) NOT NULL,
        amount DECIMAL(19, 4) NOT NULL,
        type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER') NOT NULL,
        status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
        recipient_wallet_id VARCHAR(36),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL
      )
    `);
        console.log('Database tables initialized successfully');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        return false;
    }
}
