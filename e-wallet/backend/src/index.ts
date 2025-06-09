import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { testConnection, initializeDatabase } from './models';

// Create Express app
const app = express();

// Apply middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount API routes
app.use('/api', routes);

// Handle 404 errors
app.use(notFoundHandler);

// Handle all errors
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // Initialize database tables
    await initializeDatabase();
    
    // Start listening
    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
      console.log(`Environment: ${config.environment}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Run the server
startServer(); 