import React from 'react';
import { Mail, Check } from 'lucide-react';
import { isDemoUser } from '../../lib/api';
import Toast from '../ui/Toast';

interface EmailSectionProps {
  email: string;
}

const EmailSection: React.FC<EmailSectionProps> = ({
  email,
}) => {
  const [newEmail, setNewEmail] = React.useState(email);
  const [isEditing, setIsEditing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleEmailUpdate = async () => {
    // Check if demo user
    if (await isDemoUser()) {
      setError('Cannot change email in Demo mode');
      return;
    }

    if (!newEmail || newEmail === email) {
      setIsEditing(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) throw error;
      
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating email:', err);
      setError(err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <Mail className="mr-2" /> Email Settings
      </h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        <div className="flex items-center space-x-2">
          <input
            type="email"
            value={isEditing ? newEmail : email}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={!isEditing}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {!isEditing ? (
            <button
              onClick={() => {
                setNewEmail(email);
                setIsEditing(true);
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleEmailUpdate}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <Toast message={error} type="error" onClose={() => setError(null)} />
        )}
        
        {success && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400" />
              <p className="ml-2 text-sm text-green-700">
                A confirmation email has been sent to {newEmail}. Please check your email to confirm the change.
              </p>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          After changing your email, you'll need to verify the new address by clicking the link sent to your new email.
        </p>
      </div>
    </div>
  );
};

export default EmailSection;
