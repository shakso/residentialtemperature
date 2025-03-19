import React, { useEffect, useState } from 'react';
import GatewayCard from './GatewayCard';
import { useAuth } from '../../context/AuthContext';
import { getUserGateways } from '../../lib/api';

interface Gateway {
  id: string;
  friendly_name: string;
  name: string;
  ssid: string;
  rssi: number;
  uptime: number;
  last_seen: string;
}

const GatewayGrid: React.FC = () => {
  const { user } = useAuth();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortedGateways, setSortedGateways] = useState<Gateway[]>([]);

  const handleNameUpdate = (gatewayId: string, newName: string) => {
    setGateways(prevGateways => 
      prevGateways.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, friendly_name: newName }
          : gateway
      )
    );
  };

  // Sort gateways whenever the gateways array changes
  useEffect(() => {
    const sorted = [...gateways].sort((a, b) => {
      // Handle null/undefined dates
      if (!a.last_seen) return 1;
      if (!b.last_seen) return -1;
      
      // Convert strings to Date objects for comparison
      const dateA = new Date(a.last_seen);
      const dateB = new Date(b.last_seen);
      
      // Sort in descending order (most recent first)
      return dateB.getTime() - dateA.getTime();
    });
    
    setSortedGateways(sorted);
  }, [gateways]);

  useEffect(() => {
    const fetchGateways = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getUserGateways(user.id);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid gateway data received');
        }
        
        setGateways(data);
      } catch (err: any) {
        console.error('Error fetching gateways:', err);
        setError('Failed to load gateways');
      } finally {
        setLoading(false);
      }
    };

    fetchGateways();
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

  if (sortedGateways.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500">Your gateways will appear here once we have dispatched your order.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedGateways.map((gateway) => (
        <GatewayCard 
          key={gateway.id}
          id={gateway.id}
          friendly_name={gateway.friendly_name}
          name={gateway.name}
          ssid={gateway.ssid}
          rssi={gateway.rssi}
          uptime={gateway.uptime}
          last_seen={gateway.last_seen}
          onNameUpdate={handleNameUpdate}
        />
      ))}
    </div>
  );
};

export default GatewayGrid;
