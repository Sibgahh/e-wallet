"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("./config"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const models_1 = require("./models");
// Create Express app
const app = (0, express_1.default)();
// Apply middleware
app.use((0, cors_1.default)(config_1.default.cors));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Mount API routes
app.use('/api', routes_1.default);
// Handle 404 errors
app.use(error_middleware_1.notFoundHandler);
// Handle all errors
app.use(error_middleware_1.errorHandler);
// Start the server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await (0, models_1.testConnection)();
        if (!dbConnected) {
            console.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }
        // Initialize database tables
        await (0, models_1.initializeDatabase)();
        // Start listening
        app.listen(config_1.default.server.port, () => {
            console.log(`Server running on port ${config_1.default.server.port}`);
            console.log(`Environment: ${config_1.default.environment}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Run the server
startServer();
