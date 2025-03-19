export interface Sensor {
  id: number;
  name: string;
  location: string;
  temperature: number;
  humidity: number;
  battery_level: number;
  rssi: number;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SensorReading {
  id: number;
  sensor_id: number;
  temperature: number;
  humidity: number;
  battery_level: number;
  rssi: number;
  created_at: Date;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Alert {
  id: number;
  sensor_id: number;
  type: 'high_temp' | 'low_temp' | 'low_battery' | 'offline';
  message: string;
  status: 'active' | 'resolved';
  created_at: Date;
  resolved_at: Date | null;
}
