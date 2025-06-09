import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default environment to development
const environment = process.env.NODE_ENV || 'development';

// Server configuration
const serverConfig = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key', // Should be set in production
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};

// Database configuration
const dbConfig = {
  host: '127.0.0.1', // Explicitly set to 127.0.0.1
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: '', // Explicitly set to empty string
  database: process.env.DB_NAME || 'e_wallet',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10)
};

// CORS configuration
const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};

// Export configuration
export default {
  environment,
  server: serverConfig,
  db: dbConfig,
  cors: corsConfig
}; 