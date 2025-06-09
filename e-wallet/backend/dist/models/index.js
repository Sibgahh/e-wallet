"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.testConnection = exports.pool = exports.transactionModel = exports.walletModel = exports.userModel = void 0;
const user_model_1 = __importDefault(require("./user.model"));
exports.userModel = user_model_1.default;
const wallet_model_1 = __importDefault(require("./wallet.model"));
exports.walletModel = wallet_model_1.default;
const transaction_model_1 = __importDefault(require("./transaction.model"));
exports.transactionModel = transaction_model_1.default;
const db_1 = require("./db");
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return db_1.pool; } });
Object.defineProperty(exports, "testConnection", { enumerable: true, get: function () { return db_1.testConnection; } });
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return db_1.initializeDatabase; } });
