export interface Sensor {
  id: string;
  mac: string;
  temperature: number | null;
  humidity: number | null;
  batteryLevel: number | null;
  rssi: number | null;
  lastUpdated: string | null;
}

export interface SensorCardProps {
  name: string;
  mac: string;
  temperature: number | null;
  humidity: number | null;
  batteryLevel: number | null;
  rssi: number | null;
  lastUpdated: string | null;
}
