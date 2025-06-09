import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Create connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'e_wallet'
    };
    
    console.log('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password ? '******' : '(empty)',
      database: dbConfig.database
    });
    
    // Create a connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('Successfully connected to MySQL database!');
    
    // Test a query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Database tables:', rows);
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Database connection test completed successfully!');
    } else {
      console.log('Database connection test failed!');
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  }); 