import React, { useState } from 'react';
import { UserPlus, AlertCircle, Check } from 'lucide-react';
import { isDemoUser } from '../../lib/api';

interface InviteUserSectionProps {
  role: 'view_user' | 'account_admin' | 'super_admin' | 'demo_user';
  onInvite: (email: string) => Promise<void>;
}

const InviteUserSection: React.FC<InviteUserSectionProps> = ({ role, onInvite }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Check if demo user on mount and when role changes
  React.useEffect(() => {
    const checkDemoStatus = async () => {
      const isDemo = await isDemoUser();
      setIsDisabled(isDemo || role === 'demo_user');
    };
    checkDemoStatus();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDisabled) {
      setError('Cannot invite users in Demo mode');
      return;
    }

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Insert invitation - the trigger will handle duplicate checks
      const { data: invitation, error: inviteError } = await supabase
        .from('user_invitations')
        .insert({ email })
        .select()
        .single();
      
      if (inviteError) throw inviteError;
      
      // Send invitation email using AWS SES
      const response = await fetch('/api/email/invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          invitationId: invitation.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation email');
      }

      setEmail('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error inviting user:', err); 
      if (err.message.includes('already exists')) {
        setError('A user with this email already exists');
      } else if (err.message.includes('already been sent')) {
        setError('An invitation has already been sent to this email');
      } else {
        setError('Failed to send invitation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <h2 className="text-xl font-semibold flex items-center">
        <UserPlus className="mr-2" /> Invite User
      </h2>
      
      <form onSubmit={handleSubmit} className="mt-4" onMouseDown={e => isDisabled && e.preventDefault()}>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || isDisabled}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Invite'}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 flex items-center text-green-600 text-sm">
            <Check className="h-4 w-4 mr-1" />
            Invitation sent successfully
          </div>
        )}
      </form>
    </div>
  );
};

export default InviteUserSection;
