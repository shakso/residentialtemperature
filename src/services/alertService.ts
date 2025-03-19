import pool from '../lib/db';
import { Alert } from '../types/sensor';

export const alertService = {
  async getActiveAlerts(userId: number): Promise<Alert[]> {
    const [rows] = await pool.query<Alert[]>(
      `SELECT a.* FROM alerts a
       JOIN sensors s ON a.sensor_id = s.id
       WHERE s.user_id = ? AND a.status = 'active'
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async resolveAlert(alertId: number): Promise<void> {
    await pool.query(
      `UPDATE alerts 
       SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [alertId]
    );
  },

  async createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'resolved_at'>): Promise<void> {
    await pool.query(
      `INSERT INTO alerts (sensor_id, type, message, status)
       VALUES (?, ?, ?, ?)`,
      [alert.sensor_id, alert.type, alert.message, alert.status]
    );
  }
};
