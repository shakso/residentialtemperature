import pool from '../lib/db';
import { Sensor, SensorReading } from '../types/sensor';

export const sensorService = {
  async getSensors(userId: number): Promise<Sensor[]> {
    const [rows] = await pool.query<Sensor[]>(
      'SELECT * FROM sensors WHERE user_id = ? ORDER BY name',
      [userId]
    );
    return rows;
  },

  async getSensorReadings(sensorId: number, hours: number = 24): Promise<SensorReading[]> {
    const [rows] = await pool.query<SensorReading[]>(
      `SELECT * FROM sensor_readings 
       WHERE sensor_id = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
       ORDER BY created_at`,
      [sensorId, hours]
    );
    return rows;
  },

  async updateSensor(sensorId: number, data: Partial<Sensor>): Promise<void> {
    const { name, location } = data;
    await pool.query(
      'UPDATE sensors SET name = ?, location = ? WHERE id = ?',
      [name, location, sensorId]
    );
  },

  async addSensorReading(reading: Omit<SensorReading, 'id' | 'created_at'>): Promise<void> {
    await pool.query(
      `INSERT INTO sensor_readings 
       (sensor_id, temperature, humidity, battery_level, rssi) 
       VALUES (?, ?, ?, ?, ?)`,
      [reading.sensor_id, reading.temperature, reading.humidity, reading.battery_level, reading.rssi]
    );
  }
};
