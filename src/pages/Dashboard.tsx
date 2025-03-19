import React, { useEffect, useState } from 'react';
import SensorGrid from '../components/sensors/SensorGrid';
import { Thermometer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSensors } from '../lib/api';

const Sensors = () => {
  const { user } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [sensorCount, setSensorCount] = useState(0);

  useEffect(() => {
    document.title = 'Sensors | residential temperature';
  }, []);

  useEffect(() => {
    const fetchSensorCount = async () => {
      if (!user) return;

      try {
        const data = await getUserSensors(user.id);
        setSensors(data);
        setSensorCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error('Error fetching sensor count:', err);
        setSensorCount(0);
      }
    };

    fetchSensorCount();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center h-0 md:h-auto overflow-hidden md:overflow-visible">
        <div className="hidden md:flex items-center space-x-3">
          <Thermometer className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Sensors</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor your building's temperature and humidity
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {sensors.length} sensor{sensors.length !== 1 ? 's' : ''} connected
          </span>
        </div>
      </div>
      
      <SensorGrid />
    </div>
  );
};

export default Sensors;
