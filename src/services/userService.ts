import pool from '../lib/db';
import { User } from '../types/sensor';
import crypto from 'crypto';

export const userService = {
  async createUser(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName]
    );
  },

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const [rows] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?',
      [email, passwordHash]
    );

    return rows[0] || null;
  },

  async updateUserProfile(userId: number, firstName: string, lastName: string): Promise<void> {
    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [firstName, lastName, userId]
    );
  },

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
  }
};
