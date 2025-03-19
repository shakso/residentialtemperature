import React, { useState } from 'react';
import { Wifi, Pencil, Save, X, Clock, Signal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { updateGatewayName, updateGatewayWifi } from '../../lib/api';
import Toast from '../ui/Toast';
import WifiSettingsModal from './WifiSettingsModal';

interface GatewayCardProps {
  id: string;
  friendly_name: string;
  name: string;
  ssid: string;
  rssi: number;
  uptime: number;
  last_seen: string;
  onNameUpdate: (id: string, newName: string) => void;
}

const GatewayCard: React.FC<GatewayCardProps> = ({
  id,
  friendly_name,
  name,
  ssid,
  rssi,
  uptime,
  last_seen,
  onNameUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(friendly_name);
  const [error, setError] = useState<string | null>(null);
  const [originalName] = useState(editedName);
  const [showRssi, setShowRssi] = useState(false);
  const [showWifiModal, setShowWifiModal] = useState(false);

  const getRssiStrength = (rssi: number) => {
    const absRssi = Math.abs(rssi);
    if (absRssi <= 70) return { color: 'text-green-500', text: 'Excellent' };
    if (absRssi <= 85) return { color: 'text-yellow-500', text: 'Good' };
    return { color: 'text-red-500', text: 'Poor' };
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = editedName.trim();
    
    try {
      // If trimmed name is empty, use the original gateway name
      const newName = trimmedName === '' ? name : trimmedName;
      const result = await updateGatewayName(id, newName);
      onNameUpdate(id, newName);
      setEditedName(newName);
      setIsEditing(false);
      setError('Gateway name updated successfully');
      setTimeout(() => setError(null), 3000);
    } catch (error: any) {
      console.error('Error updating gateway name:', error);
      const errorMessage = error.message || 'Failed to update gateway name';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
      setEditedName(originalName);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(originalName);
    setIsEditing(false);
  };

  const handleWifiUpdate = async (newSsid: string, password: string) => {
    try {
      await updateGatewayWifi(id, newSsid, password);
      setError('WiFi settings updated successfully');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      throw error;
    }
  };

  const signalStrength = getRssiStrength(rssi);

  const formatLastSeen = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Never';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center group">
          {isEditing ? (
            <form onSubmit={handleNameSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-xl font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1 w-48"
                autoFocus
                placeholder={name}
              />
              <button
                type="submit"
                className="p-1 text-green-600 hover:text-green-700"
                title="Save"
              >
                <Save size={18} />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 text-gray-400 hover:text-gray-500"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-900">{editedName}</h3>
              <Pencil 
                size={14} 
                className="ml-2 text-gray-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
              />
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div 
            className="flex items-center cursor-help"
            onMouseEnter={() => setShowRssi(true)}
            onMouseLeave={() => setShowRssi(false)}
          >
            <Signal className={signalStrength.color} size={16} />
            {showRssi && (
              <div className="absolute mt-1 transform translate-y-4 bg-gray-900 text-white text-xs rounded py-1 px-2 z-10">
                Signal: {signalStrength.text} ({rssi} RSSI)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gateway Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="text-blue-500 mr-2" size={16} />
            <span className="text-sm text-gray-600">{ssid}</span>
          </div>
          <button 
            onClick={() => setShowWifiModal(true)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Change
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center">
            <Clock className="text-gray-400 mr-2" size={16} />
            <span className="text-sm text-gray-600">Uptime: {formatUptime(uptime)}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Last seen: {formatLastSeen(last_seen)}
        </div>
      </div>

      {error && (
        <Toast 
          message={error} 
          type={error.includes('Cannot') || error.includes('Failed') ? 'error' : 'success'} 
          onClose={() => setError(null)} 
        />
      )}
      
      {showWifiModal && (
        <WifiSettingsModal
          gatewayName={friendly_name}
          currentSsid={ssid}
          onClose={() => setShowWifiModal(false)}
          onSubmit={handleWifiUpdate}
        />
      )}
    </div>
  );
};

export default GatewayCard;
