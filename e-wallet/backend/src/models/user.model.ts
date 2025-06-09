import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { pool } from './db';
import { User } from '@e-wallet/shared';

class UserModel {
  /**
   * Create a new user
   * @param username User's username
   * @param email User's email
   * @param password User's password (will be hashed)
   * @returns The created user
   */
  async create(username: string, email: string, password: string): Promise<User> {
    const connection = await pool.getConnection();
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Generate a UUID for the new user
      const id = uuidv4();
      
      // Get current timestamp
      const now = new Date();
      
      // Insert the user into the database
      await connection.execute(
        'INSERT INTO users (id, username, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, username, email, hashedPassword, now, now]
      );
      
      // Return the created user (without the password)
      return {
        id,
        username,
        email,
        password: hashedPassword, // Note: In a real app, we would not return this
        createdAt: now,
        updatedAt: now
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find a user by ID
   * @param id User ID
   * @returns The user if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      const users = rows as any[];
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at)
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find a user by username
   * @param username Username to search for
   * @returns The user if found, null otherwise
   */
  async findByUsername(username: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      const users = rows as any[];
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at)
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Find a user by email
   * @param email Email to search for
   * @returns The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      const users = rows as any[];
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at)
      };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Verify a user's password
   * @param user User object
   * @param password Password to verify
   * @returns True if the password is correct, false otherwise
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
  
  /**
   * Update a user's information
   * @param id User ID
   * @param data Data to update
   * @returns The updated user
   */
  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      // Get the user first
      const user = await this.findById(id);
      if (!user) {
        return null;
      }
      
      // Prepare update fields
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (data.username) {
        updateFields.push('username = ?');
        values.push(data.username);
      }
      
      if (data.email) {
        updateFields.push('email = ?');
        values.push(data.email);
      }
      
      if (data.password) {
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        updateFields.push('password = ?');
        values.push(hashedPassword);
      }
      
      // If no fields to update, return the user as is
      if (updateFields.length === 0) {
        return user;
      }
      
      // Add the ID to the values array
      values.push(id);
      
      // Execute the update
      await connection.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Get the updated user
      return this.findById(id);
    } finally {
      connection.release();
    }
  }
  
  /**
   * Delete a user
   * @param id User ID
   * @returns True if the user was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      ) as any;
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new UserModel(); 