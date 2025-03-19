import React, { useState } from 'react';
import { Wifi, X } from 'lucide-react';

interface WifiSettingsModalProps {
  gatewayName: string;
  currentSsid: string;
  onClose: () => void;
  onSubmit: (ssid: string, password: string) => Promise<void>;
}

const WifiSettingsModal: React.FC<WifiSettingsModalProps> = ({
  gatewayName,
  currentSsid,
  onClose,
  onSubmit
}) => {
  const [ssid, setSsid] = useState(currentSsid);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ssid.trim()) {
      setError('WiFi name is required');
      return;
    }

    if (!password.trim()) {
      setError('WiFi password is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(ssid, password);
      onClose();
    } catch (err: any) {
      console.error('Error updating WiFi settings:', err);
      setError(err.message || 'Failed to update WiFi settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Wifi className="mr-2 text-blue-500" size={24} />
            Change WiFi details for "{gatewayName}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="ssid" className="block text-sm font-medium text-gray-700 mb-1">
              WiFi Name (SSID)
            </label>
            <input
              type="text"
              id="ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter WiFi name"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              WiFi Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter WiFi password"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WifiSettingsModal;
