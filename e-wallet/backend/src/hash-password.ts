import bcrypt from 'bcrypt';

async function hashPassword() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  console.log('Hashed password:', hashedPassword);
}

hashPassword().catch(console.error);
