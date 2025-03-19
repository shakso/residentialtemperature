import React, { useState, useEffect } from 'react';
import { User, MapPin, AlertCircle, Check, Save } from 'lucide-react';
import { isDemoUser } from '../../lib/api';
import Toast from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

interface UserInfoSectionProps {
  firstName: string;
  lastName: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  role: 'view_user' | 'account_admin' | 'super_admin' | 'demo_user';
  onUpdate: (field: string, value: string) => Promise<void>;
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  firstName,
  lastName,
  address_line1,
  address_line2,
  city,
  postcode,
  role,
  onUpdate
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Local state for form fields
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [localAddress1, setLocalAddress1] = useState(address_line1);
  const [localAddress2, setLocalAddress2] = useState(address_line2);
  const [localCity, setLocalCity] = useState(city);
  const [localPostcode, setLocalPostcode] = useState(postcode);

  const isViewUser = role === 'view_user';
  const isDemoUser = role === 'demo_user';

  // Update local state when props change
  useEffect(() => {
    setLocalFirstName(firstName);
    setLocalLastName(lastName);
    setLocalAddress1(address_line1);
    setLocalAddress2(address_line2);
    setLocalCity(city);
    setLocalPostcode(postcode);
  }, [firstName, lastName, address_line1, address_line2, city, postcode]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare updates object
      const updates: Record<string, string> = {
        first_name: localFirstName,
        last_name: localLastName
      };

      // Only include address fields for admin users
      if (!isViewUser) {
        Object.assign(updates, {
          address_line1: localAddress1,
          address_line2: localAddress2,
          city: localCity,
          postcode: localPostcode
        });
      }

      // Update profile directly
      await onUpdate('profile', JSON.stringify(updates));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating user info:', err);
      setError(err.message || 'Failed to update information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Profile Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <User className="mr-2" /> Profile Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={localFirstName}
              onChange={(e) => setLocalFirstName(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDemoUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isDemoUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={localLastName}
              onChange={(e) => setLocalLastName(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDemoUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isDemoUser}
            />
          </div>
        </div>
      </div>

      {/* Address Information - Only shown for admin roles */}
      {!isViewUser && (
        <div className="space-y-4">
          <hr className="my-6 border-gray-200" />
          <h2 className="text-xl font-semibold flex items-center">
            <MapPin className="mr-2" /> Address
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                value={localAddress1}
                onChange={(e) => setLocalAddress1(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDemoUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isDemoUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={localAddress2}
                onChange={(e) => setLocalAddress2(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDemoUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isDemoUser}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={localCity}
                  onChange={(e) => setLocalCity(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDemoUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isDemoUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postcode</label>
                <input
                  type="text"
                  value={localPostcode}
                  onChange={(e) => setLocalPostcode(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDemoUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isDemoUser}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button and Status Messages */}
      <div className="mt-8 flex justify-end items-center space-x-4">
        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="h-4 w-4 mr-1" />
            Changes saved successfully
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading || isDemoUser}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'} 
        </button>
      </div>

      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default UserInfoSection;
