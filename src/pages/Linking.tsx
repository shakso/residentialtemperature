import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ChevronRight, ChevronDown, Unlink, Link2, AlertCircle, Plus } from 'lucide-react';
import {
  getAllUsers,
  getUserDevices,
  unlinkSensor,
  unlinkGateway,
  getUnlinkedDevices,
  linkSensor,
  linkGateway,
  createSensor
} from '../lib/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Device {
  id: string;
  mac?: string;
  name?: string;
  friendly_name?: string;
}

interface UserDevices {
  sensors: Device[];
  gateways: Device[];
}

const Linking = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [unlinkedDevices, setUnlinkedDevices] = useState<UserDevices | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDevices, setUserDevices] = useState<UserDevices | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [macAddress, setMacAddress] = useState('');
  const [addingSensor, setAddingSensor] = useState(false);

  useEffect(() => {
    document.title = 'Device Linking | residential temperature';
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchUnlinkedDevices();
  }, []);

  const fetchUnlinkedDevices = async () => {
    try {
      const data = await getUnlinkedDevices(selectedUserId);
      setUnlinkedDevices(data);
    } catch (err: any) {
      console.error('Error fetching unlinked devices:', err);
      setError('Failed to load unlinked devices');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setUserDevices(null);
        return;
      }
      
      setSelectedUserId(userId);
      const devices = await getUserDevices(userId);
      const unlinkedDevices = await getUnlinkedDevices(userId);
      setUserDevices(devices);
      setUnlinkedDevices(unlinkedDevices);
    } catch (err: any) {
      console.error('Error fetching user devices:', err);
      setError('Failed to load user devices');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (type: 'sensor' | 'gateway', deviceId: string) => {
    if (!selectedUserId) return;
    
    try {
      setUnlinking(true);
      setError(null);
      setSuccessMessage(null);
      
      if (type === 'sensor') {
        await unlinkSensor(deviceId, selectedUserId);
      } else {
        await unlinkGateway(deviceId, selectedUserId);
      }
      
      // Refresh devices list
      const devices = await getUserDevices(selectedUserId);
      setUserDevices(devices);
      
      setSuccessMessage(`Device unlinked successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error unlinking device:', err);
      setError('Failed to unlink device');
    } finally {
      setUnlinking(false);
    }
  };

  const handleLink = async (type: 'sensor' | 'gateway', deviceId: string) => {
    if (!selectedUserId) return;
    
    try {
      setLinking(true);
      setError(null);
      setSuccessMessage(null);
      
      if (type === 'sensor') {
        await linkSensor(deviceId, selectedUserId);
      } else {
        await linkGateway(deviceId, selectedUserId);
      }
      
      // Refresh both lists
      const devices = await getUserDevices(selectedUserId);
      setUserDevices(devices);
      await fetchUnlinkedDevices();
      
      setSuccessMessage(`Device linked successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error linking device:', err);
      setError('Failed to link device');
    } finally {
      setLinking(false);
    }
  };

  const handleAddSensor = async () => {
    try {
      setAddingSensor(true);
      setError(null);
      
      await createSensor(macAddress);
      await fetchUnlinkedDevices();
      
      setShowAddSensor(false);
      setMacAddress('');
      setSuccessMessage('Sensor added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error adding sensor:', err);
      setError(err.message || 'Failed to add sensor');
    } finally {
      setAddingSensor(false);
    }
  };

  if (user?.email !== 'alex@alexshakespeare.com') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="hidden md:flex items-center space-x-3">
          <Link2 className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Device Linking</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage user device associations
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full">
            {users.length} User{users.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setShowAddSensor(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Sensor
        </button>
      </div>

      {/* Add Sensor Modal */}
      {showAddSensor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Sensor</h2>
              <button
                onClick={() => {
                  setShowAddSensor(false);
                  setMacAddress('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="macAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  MAC Address
                </label>
                <input
                  id="macAddress"
                  type="text"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 12))}
                  placeholder="Enter 12 hex characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter exactly 12 hexadecimal characters (0-9, A-F)
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddSensor(false);
                    setMacAddress('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSensor}
                  disabled={addingSensor || macAddress.length !== 12}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {addingSensor ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add Sensor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
          <div className="mr-2">✓</div>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="mr-2" size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md divide-y">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="p-6">
              <button
                onClick={() => handleUserSelect(user.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="text-lg font-medium">
                    {user.first_name || 'No name'} {user.last_name || ''}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {selectedUserId === user.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {selectedUserId === user.id && (
                <div className="mt-4 pl-4 space-y-6">
                  {/* Unlinked Devices */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-blue-800 uppercase tracking-wider mb-4">
                      Available Devices
                    </h4>
                    
                    {/* Unlinked Sensors */}
                    <div className="mb-4">
                      <h5 className="text-xs font-medium text-blue-600 uppercase mb-2">
                        Sensors ({unlinkedDevices?.sensors?.length || 0})
                      </h5>
                      {unlinkedDevices?.sensors?.length > 0 ? (
                        <ul className="space-y-2">
                          {unlinkedDevices.sensors.map((sensor) => (
                            <li key={sensor.id} className="flex items-center justify-between text-sm">
                              <span className="text-blue-700">{sensor.friendly_name || sensor.mac}</span>
                              <button
                                onClick={() => handleLink('sensor', sensor.id)}
                                disabled={linking}
                                className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 rounded-md border border-blue-200 transition-colors"
                                title="Link sensor"
                              >
                                <Plus size={14} />
                                <span className="text-xs font-medium">Add</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-blue-600">No unlinked sensors available</p>
                      )}
                    </div>
                    
                    {/* Unlinked Gateways */}
                    <div>
                      <h5 className="text-xs font-medium text-blue-600 uppercase mb-2">
                        Gateways ({unlinkedDevices?.gateways?.length || 0})
                      </h5>
                      {unlinkedDevices?.gateways?.length > 0 ? (
                        <ul className="space-y-2">
                          {unlinkedDevices.gateways.map((gateway) => (
                            <li key={gateway.id} className="flex items-center justify-between text-sm">
                              <span className="text-blue-700">{gateway.friendly_name || gateway.name}</span>
                              <button
                                onClick={() => handleLink('gateway', gateway.id)}
                                disabled={linking}
                                className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 rounded-md border border-blue-200 transition-colors"
                                title="Link gateway"
                              >
                                <Plus size={14} />
                                <span className="text-xs font-medium">Add</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-blue-600">No unlinked gateways available</p>
                      )}
                    </div>
                  </div>

                  {/* Sensors */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Sensors ({userDevices?.sensors?.length || 0})
                    </h4>
                    {userDevices?.sensors?.length > 0 ? (
                      <ul className="space-y-2">
                        {userDevices.sensors.map((sensor) => (
                          <li key={sensor.id} className="flex items-center justify-between text-sm">
                            <span>{sensor.friendly_name || sensor.mac}</span>
                            <button
                              onClick={() => handleUnlink('sensor', sensor.id)}
                              disabled={unlinking}
                              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-md border border-red-200 transition-colors"
                              title="Unlink sensor"
                            >
                              <Unlink size={14} />
                              <span className="text-xs font-medium">Remove</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No sensors assigned</p>
                    )}
                  </div>

                  {/* Gateways */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Gateways ({userDevices?.gateways?.length || 0})
                    </h4>
                    {userDevices?.gateways?.length > 0 ? (
                      <ul className="space-y-2">
                        {userDevices.gateways.map((gateway) => (
                          <li key={gateway.id} className="flex items-center justify-between text-sm">
                            <span>{gateway.friendly_name || gateway.name}</span>
                            <button
                              onClick={() => handleUnlink('gateway', gateway.id)}
                              disabled={unlinking}
                              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-md border border-red-200 transition-colors"
                              title="Unlink gateway"
                            >
                              <Unlink size={14} />
                              <span className="text-xs font-medium">Remove</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No gateways assigned</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
};

export default Linking;
