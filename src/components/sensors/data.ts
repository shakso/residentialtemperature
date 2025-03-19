import { format } from 'date-fns';
import { Sensor } from './types';

export const sensors: Sensor[] = [
  {
    id: 1,
    name: 'Living Room',
    temperature: 23.5,
    humidity: 45,
    batteryLevel: 85,
    rssi: 65,
    lastUpdated: format(new Date(), 'HH:mm'),
  },
  {
    id: 2,
    name: 'Kitchen',
    temperature: 24.8,
    humidity: 52,
    batteryLevel: 92,
    rssi: 72,
    lastUpdated: format(new Date(), 'HH:mm'),
  },
  {
    id: 3,
    name: 'Bedroom',
    temperature: 21.3,
    humidity: 48,
    batteryLevel: 76,
    rssi: 88,
    lastUpdated: format(new Date(), 'HH:mm'),
  },
  {
    id: 4,
    name: 'Bathroom',
    temperature: 25.2,
    humidity: 65,
    batteryLevel: 88,
    rssi: 95,
    lastUpdated: format(new Date(), 'HH:mm'),
  },
  {
    id: 5,
    name: 'Office',
    temperature: 22.7,
    humidity: 43,
    batteryLevel: 95,
    rssi: 68,
    lastUpdated: format(new Date(), 'HH:mm'),
  },
  {
    id: 6,
    name: 'Garage',
    temperature: 19.7,
    humidity: 58,
    batteryLevel: 82,
    rssi: 78,
    lastUpdated: format(new Date(), 'HH:mm'),
  },
];
