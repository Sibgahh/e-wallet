import { userModel, walletModel, transactionModel } from './models';
import bcrypt from 'bcrypt';

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Check if test user already exists
    const existingUser = await userModel.findByUsername('testuser');
    
    if (!existingUser) {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const testUser = await userModel.create('testuser', 'test@example.com', hashedPassword);
      console.log('Test user created:', testUser.username);

      // Create a wallet for the test user
      const wallet = await walletModel.create(testUser.id, 'USD');
      console.log('Wallet created:', wallet.id);

      // Add some initial balance
      await walletModel.updateBalance(wallet.id, 1000);
      console.log('Initial balance added: $1000');

      // Create some sample transactions
      await transactionModel.create(
        wallet.id,
        500,
        'DEPOSIT',
        undefined,
        'Initial deposit'
      );

      await transactionModel.create(
        wallet.id,
        100,
        'WITHDRAWAL',
        undefined,
        'ATM withdrawal'
      );

      console.log('Sample transactions created');
    } else {
      console.log('Test user already exists');
    }

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
