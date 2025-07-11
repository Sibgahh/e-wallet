"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const wallet_routes_1 = __importDefault(require("./wallet.routes"));
const transaction_routes_1 = __importDefault(require("./transaction.routes"));
const router = (0, express_1.Router)();
// Define API routes
router.use('/auth', auth_routes_1.default);
router.use('/wallets', wallet_routes_1.default);
router.use('/transactions', transaction_routes_1.default);
exports.default = router;
