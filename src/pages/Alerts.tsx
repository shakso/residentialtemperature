import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import AlertItem from '../components/alerts/AlertItem';
import { useEffect } from 'react';

const initialAlerts = [
  {
    id: 1,
    title: 'High Temperature Alert',
    description: 'Kitchen temperature exceeded threshold: 28°C',
    severity: 'critical' as const,
    timestamp: '2024-03-15T14:30:00',
    status: 'active' as const,
  },
  {
    id: 2,
    title: 'Sensor Offline',
    description: 'Bedroom sensor not responding',
    severity: 'warning' as const,
    timestamp: '2024-03-15T13:15:00',
    status: 'active' as const,
  },
  {
    id: 3,
    title: 'Low Temperature Alert',
    description: 'Garage temperature below threshold: 15°C',
    severity: 'resolved' as const,
    timestamp: '2024-03-15T10:45:00',
    status: 'resolved' as const,
  },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    document.title = 'Alerts | residential temperature';
  }, []);
  
  const handleAcknowledge = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: 'resolved' as const, severity: 'resolved' as const } 
        : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="hidden md:flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Alerts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor and manage system alerts
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
            {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertItem
            key={alert.id}
            {...alert}
            onAcknowledge={handleAcknowledge}
          />
        ))}
      </div>
    </div>
  );
};

export default Alerts;
