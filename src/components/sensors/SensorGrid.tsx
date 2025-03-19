import React, { useEffect, useState } from 'react';
import SensorCard from './SensorCard';
import { useAuth } from '../../context/AuthContext';
import { getUserSensors } from '../../lib/api';
import { Sensor } from './types';

const SensorGrid: React.FC = () => {
  const { user } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNameUpdate = (sensorId: string, newName: string) => {
    setSensors(prevSensors => 
      prevSensors.map(sensor => 
        sensor.id === sensorId 
          ? { ...sensor, name: newName }
          : sensor
      )
    );
  };

  useEffect(() => {
    const fetchSensors = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getUserSensors(user.id);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid sensor data received');
        }
        
        setSensors(data);
      } catch (err: any) {
        console.error('Error fetching sensors:', err);
        setError('Failed to load sensors');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500">Your sensors will appear here once we have dispatched your order.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sensors.map((sensor) => (
        <SensorCard 
          key={sensor.id} 
          id={sensor.id}
          name={sensor.name} 
          mac={sensor.mac}
          temperature={sensor.temperature}
          humidity={sensor.humidity}
          batteryLevel={sensor.batteryLevel}
          rssi={sensor.rssi}
          lastUpdated={sensor.lastUpdated}
          onNameUpdate={handleNameUpdate}
        />
      ))}
    </div>
  );
};

export default SensorGrid;
