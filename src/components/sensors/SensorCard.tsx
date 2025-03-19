import React, { useState } from 'react';
import { Droplets, Pencil, Wifi, Battery, BatteryMedium, BatteryLow, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { updateSensorName } from '../../lib/api';
import Toast from '../ui/Toast';

interface SensorCardProps {
  id: string;
  name: string;
  mac: string;
  temperature: number | null;
  humidity: number | null;
  batteryLevel: number | null;
  rssi: number | null;
  lastUpdated: string | null;
  onNameUpdate: (id: string, newName: string) => void;
}

const SensorCard: React.FC<SensorCardProps> = ({
  id,
  name,
  mac,
  temperature,
  humidity,
  batteryLevel,
  rssi,
  lastUpdated,
  onNameUpdate,
}) => {
  const [showRssi, setShowRssi] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sensorName, setSensorName] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const labelId = mac.slice(-6);
  const [originalName] = useState(name);

  const getBatteryIcon = (level: number) => {
    if (level > 75) return <Battery className="text-green-500" size={16} />;
    if (level > 25) return <BatteryMedium className="text-yellow-500" size={16} />;
    return <BatteryLow className="text-red-500" size={16} />;
  };

  const getRssiColor = (rssi: number) => {
    rssi = Math.abs(rssi);
    if (rssi <= 70) return 'text-green-500';
    if (rssi <= 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRssiText = (rssi: number) => {
    rssi = Math.abs(rssi);
    if (rssi <= 70) return 'Excellent';
    if (rssi <= 90) return 'Fair';
    return 'Poor';
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = sensorName.trim();
    
    try {
      // If trimmed name is empty, use the original name
      const newName = trimmedName === '' ? name : trimmedName;
      const result = await updateSensorName(id, newName);
      if (result === null) {
        throw new Error('Failed to update sensor name');
      }
      onNameUpdate(id, newName);
      setError('Sensor name updated successfully');
      setTimeout(() => setError(null), 3000);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating sensor name:', error);
      const errorMessage = error.message || 'Failed to update sensor name';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
      setSensorName(originalName);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setSensorName(originalName);
    setIsEditing(false);
  };

  const formatLastUpdated = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
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
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
                className="text-xl font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1 w-48"
                autoFocus
                placeholder="Enter sensor name"
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
              <h3 className="text-xl font-semibold text-gray-900">{sensorName}</h3>
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
            title={`Battery: ${batteryLevel}%`}
          >
            {getBatteryIcon(batteryLevel)}
            <span className="text-xs text-gray-400 ml-1">{batteryLevel}%</span>
          </div>
          <div 
            className="flex items-center cursor-help"
            onMouseEnter={() => setShowRssi(true)}
            onMouseLeave={() => setShowRssi(false)}
          >
            <Wifi className={getRssiColor(rssi)} size={16} />
            {showRssi && (
              <div className="absolute mt-1 transform translate-y-4 bg-gray-900 text-white text-xs rounded py-1 px-2 z-10">
                Signal: {getRssiText(rssi)} ({rssi} RSSI)
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <Toast
          message={error}
          type={error.includes('Cannot') || error.includes('Failed') ? 'error' : 'success'}
          onClose={() => setError(null)}
        />
      )}

      {/* Temperature Display */}
      <div className="text-center mb-8">
        <div className="text-5xl font-light text-gray-800 tracking-tight">
          {temperature !== null ? temperature.toFixed(1) : '--'}
          <span className="text-2xl align-top">°C</span>
        </div>
      </div>

      {/* Humidity */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Droplets size={16} className="text-blue-500" />
        <span className="text-gray-600">{humidity !== null ? `${humidity.toFixed(1)}%` : '--'}</span>
      </div>

      {/* Last Updated and Label */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-500">
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>
        <div className="text-sm text-gray-500">
          Label Name: {labelId}
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
