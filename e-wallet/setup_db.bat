@echo off
echo Setting up the e-wallet database...

rem Path to MySQL executable - adjust if needed
set MYSQL_PATH=mysql

rem Database credentials
set DB_USER=root
set DB_PASS=
set DB_NAME=e_wallet

rem Create database
echo Creating database...
%MYSQL_PATH% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

rem Use the database and create tables
echo Creating tables...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% -e "

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  balance DECIMAL(19, 4) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
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
);

-- Create indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_recipient_wallet_id ON transactions(recipient_wallet_id);
"

rem Insert sample data
echo Inserting sample data...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% -e "
-- Create a test user
INSERT INTO users (id, username, email, password)
VALUES ('00000000-0000-0000-0000-000000000001', 'testuser', 'test@example.com', 'password123')
ON DUPLICATE KEY UPDATE username=username;

-- Create a wallet for the test user
INSERT INTO wallets (id, user_id, balance, currency)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1000.00, 'USD')
ON DUPLICATE KEY UPDATE balance=1000.00;

-- Create some sample transactions
INSERT INTO transactions (id, wallet_id, amount, type, status, description)
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 500.00, 'DEPOSIT', 'COMPLETED', 'Initial deposit')
ON DUPLICATE KEY UPDATE amount=amount;

INSERT INTO transactions (id, wallet_id, amount, type, status, description)
VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 50.00, 'WITHDRAWAL', 'COMPLETED', 'ATM withdrawal')
ON DUPLICATE KEY UPDATE amount=amount;
"

echo Showing tables...
%MYSQL_PATH% -u %DB_USER% %DB_NAME% -e "SHOW TABLES;"

echo Database setup complete!
pause 