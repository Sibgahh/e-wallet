# E-Wallet Application

A simple e-wallet application built with TypeScript, React, Express, and MySQL, following software engineering principles such as modularity, scalability, and maintainability.

## Project Structure

The project is organized as a monorepo with the following packages:

- **frontend**: React-based user interface
- **backend**: Express API server with MySQL database
- **shared**: Common types and utilities shared between frontend and backend
- **database**: SQL scripts and setup instructions

## Features

- User authentication (register, login, profile)
- Wallet management (create, view)
- Transaction handling (deposit, withdraw, transfer)
- Transaction history

## Technologies Used

- **Frontend**:
  - React
  - TypeScript
  - React Router
  - Styled Components
  - Axios

- **Backend**:
  - Node.js
  - Express
  - TypeScript
  - MySQL
  - JSON Web Tokens (JWT)

- **Shared**:
  - TypeScript
  - Zod (for validation)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MySQL (v5.7+ or v8.0+ recommended)

### Database Setup

1. Install MySQL if you haven't already:
   - Windows: Download and install MySQL from the [official website](https://dev.mysql.com/downloads/installer/)
   - macOS: Use Homebrew: `brew install mysql`
   - Linux (Ubuntu/Debian): `sudo apt install mysql-server`

2. Run the database setup script:
   ```
   cd database
   mysql -u root -p < setup.sql
   ```

   For detailed instructions, see the [database setup README](./database/README.md).

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd e-wallet
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Copy the example environment file and update it with your database credentials:
   ```
   cp backend/env.example backend/.env
   ```
   Edit the `.env` file to match your MySQL configuration.

### Running the Application

1. Build the shared package:
   ```
   npm run build:shared
   ```

2. Start the backend:
   ```
   npm run start:backend
   ```

3. Start the frontend:
   ```
   npm run start:frontend
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

### Test Account

The database setup script creates a test account with the following credentials:

- Username: `testuser`
- Email: `test@example.com`
- Password: `password123`
- Initial wallet balance: 1000.00 USD

## Project Architecture

### Frontend

The frontend follows a component-based architecture with:

- **Components**: Reusable UI components
- **Pages**: Top-level page components
- **Services**: API communication
- **Contexts**: State management
- **Hooks**: Custom React hooks

### Backend

The backend follows a layered architecture with:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Models**: Data access layer
- **Routes**: Define API endpoints
- **Middleware**: Authentication, error handling, etc.
- **Config**: Application configuration

### Shared

The shared package contains:

- **Types**: Type definitions for entities
- **Utils**: Utility functions for validation, etc.

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/profile`: Get user profile

### Wallets

- `GET /api/wallets`: Get all wallets for current user
- `GET /api/wallets/:id`: Get wallet by ID
- `POST /api/wallets`: Create a new wallet
- `POST /api/wallets/:id/deposit`: Deposit funds
- `POST /api/wallets/:id/withdraw`: Withdraw funds
- `POST /api/wallets/transfer`: Transfer funds between wallets

### Transactions

- `GET /api/transactions/:id`: Get transaction by ID
- `GET /api/transactions/wallet/:walletId`: Get all transactions for a wallet
- `POST /api/transactions`: Create a new transaction

## Software Engineering Principles Applied

- **Modularity**: Code is organized into modular components with clear responsibilities
- **Scalability**: Application is designed to scale with additional features
- **Maintainability**: Consistent code style and organization
- **Separation of Concerns**: Clear separation between UI, business logic, and data access
- **DRY (Don't Repeat Yourself)**: Common code is extracted into shared libraries
- **SOLID Principles**: Single responsibility, Open/closed, etc.
- **Error Handling**: Robust error handling throughout the application
- **Type Safety**: Strong typing with TypeScript

## Testing

Run tests with:

```
npm test
```

## License

MIT 