import React, { useState, useEffect } from 'react';
import { Router } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserGateways } from '../lib/api';
import GatewayGrid from '../components/gateways/GatewayGrid';

const Gateways = () => {
  const { user } = useAuth();
  const [gatewayCount, setGatewayCount] = useState(0);

  useEffect(() => {
    document.title = 'Gateways | residential temperature';
  }, []);

  useEffect(() => {
    const fetchGatewayCount = async () => {
      if (!user) return;

      try {
        const gateways = await getUserGateways(user.id);
        setGatewayCount(Array.isArray(gateways) ? gateways.length : 0);
      } catch (err) {
        console.error('Error fetching gateway count:', err);
        setGatewayCount(0);
      }
    };

    fetchGatewayCount();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="hidden md:flex items-center space-x-3">
          <Router className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Gateways</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your gateway connections
            </p>
          </div>
        </div>
        <div className="hidden md:flex text-sm text-gray-500 items-center">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {gatewayCount} gateway{gatewayCount !== 1 ? 's' : ''} connected
          </span>
        </div>
      </div>
      
      <GatewayGrid />
    </div>
  );
};

export default Gateways;
