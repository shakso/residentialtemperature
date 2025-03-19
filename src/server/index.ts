import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import type { QueryResultRow } from 'pg';
import pool from './lib/db';
import type { UserRow, ProfileRow } from './types';
import { validateQueryResult } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUserResult = await pool.query<UserRow>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    const { rowCount } = validateQueryResult(existingUserResult);
    
    if (rowCount > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const result = validateQueryResult(await pool.query<UserRow>(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, first_name, last_name`,
      [email, hashedPassword, firstName, lastName]
    ));
    
    const user = result.rows[0];
    
    res.status(201).json({ user });
  } catch (err: any) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const result = validateQueryResult(await pool.query<UserRow>(
      'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1',
      [email]
    ));
    
    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0] as unknown as UserRow;
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      token 
    });
  } catch (err: any) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: err.message });
  }
});

// User profile routes
app.get('/api/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, address_line1, address_line2, city, postcode, 
              subscription_plan, wifi_configured, wifi_ssid, payment_id, created_at
       FROM profiles
       WHERE id = $1`,
      [userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    
    // Check if profile exists
    const existingProfileResult = await pool.query<ProfileRow>(
      'SELECT id FROM profiles WHERE id = $1',
      [userId]
    );
    
    const { rowCount } = validateQueryResult(existingProfileResult);
    
    let result;
    
    if (rowCount > 0) {
      // Update existing profile
      const {
        first_name,
        last_name,
        address_line1,
        address_line2,
        city,
        postcode,
        subscription_plan,
        wifi_configured,
        wifi_ssid,
        wifi_password,
        payment_id
      } = profileData;
      
      result = await pool.query<ProfileRow>(
        `UPDATE profiles
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             address_line1 = COALESCE($3, address_line1),
             address_line2 = COALESCE($4, address_line2),
             city = COALESCE($5, city),
             postcode = COALESCE($6, postcode),
             subscription_plan = COALESCE($7, subscription_plan),
             wifi_configured = COALESCE($8, wifi_configured),
             wifi_ssid = COALESCE($9, wifi_ssid),
             wifi_password = COALESCE($10, wifi_password),
             payment_id = COALESCE($11, payment_id),
             updated_at = NOW()
         WHERE id = $12
         RETURNING *`,
        [
          first_name,
          last_name,
          address_line1,
          address_line2,
          city,
          postcode,
          subscription_plan,
          wifi_configured,
          wifi_ssid,
          wifi_password,
          payment_id,
          userId
        ]
      );
    } else {
      // Create new profile
      const {
        first_name,
        last_name,
        address_line1,
        address_line2,
        city,
        postcode,
        subscription_plan,
        wifi_configured,
        wifi_ssid,
        wifi_password,
        payment_id
      } = profileData;
      
      result = await pool.query<ProfileRow>(
        `INSERT INTO profiles (
           id, first_name, last_name, address_line1, address_line2, city, postcode,
           subscription_plan, wifi_configured, wifi_ssid, wifi_password, payment_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          userId,
          first_name,
          last_name,
          address_line1,
          address_line2,
          city,
          postcode,
          subscription_plan,
          wifi_configured,
          wifi_ssid,
          wifi_password,
          payment_id
        ]
      );
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sensor routes
app.get('/api/sensors', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT s.id, s.name, s.location, s.temperature, s.humidity, s.battery_level, s.rssi, s.last_updated
       FROM sensors s
       JOIN profiles p ON s.user_id = p.id
       WHERE p.id = $1
       ORDER BY s.name`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching sensors:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sensors/:id/readings', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const sensorId = req.params.id;
    const hours = req.query.hours || 24;
    
    // Verify sensor belongs to user
    const sensorCheck = await pool.query(
      `SELECT s.id
       FROM sensors s
       JOIN profiles p ON s.user_id = p.id
       WHERE s.id = $1 AND p.id = $2`,
      [sensorId, userId]
    );
    
    if (sensorCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Sensor not found or access denied' });
    }
    
    const result = await pool.query(
      `SELECT id, sensor_id, temperature, humidity, battery_level, rssi, created_at
       FROM sensor_readings
       WHERE sensor_id = $1
       AND created_at >= NOW() - INTERVAL '${hours} hours'
       ORDER BY created_at`,
      [sensorId]
    );
    
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching sensor readings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Alert routes
app.get('/api/alerts', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT a.id, a.sensor_id, a.type, a.message, a.status, a.created_at, a.resolved_at, s.name as sensor_name
       FROM alerts a
       JOIN sensors s ON a.sensor_id = s.id
       JOIN profiles p ON s.user_id = p.id
       WHERE p.id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alerts/:id/resolve', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;
    
    // Verify alert belongs to user
    const alertCheck = await pool.query(
      `SELECT a.id
       FROM alerts a
       JOIN sensors s ON a.sensor_id = s.id
       JOIN profiles p ON s.user_id = p.id
       WHERE a.id = $1 AND p.id = $2`,
      [alertId, userId]
    );
    
    if (alertCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Alert not found or access denied' });
    }
    
    const result = await pool.query(
      `UPDATE alerts
       SET status = 'resolved', resolved_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [alertId]
    );
    
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error resolving alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
