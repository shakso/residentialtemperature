import { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../lib/api';
import EmailSection from '../components/account/EmailSection';
import PasswordSection from '../components/account/PasswordSection';
import UserInfoSection from '../components/account/UserInfoSection';
import SubscriptionSection from '../components/account/SubscriptionSection';
import InviteUserSection from '../components/settings/InviteUserSection';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Settings | residential temperature';
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getUserProfile(user.id);
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]); // Only re-run if user ID changes

  const handleUpdate = async (field: string, value: string) => {
    if (!user?.id) return;

    try {
      setError(null);

      if (field === 'profile') {
        // Handle bulk profile update
        const updates = JSON.parse(value);
        const updatedProfile = await updateUserProfile(user.id, updates);
        setProfile(updatedProfile);
      } else {
        // Handle single field update
        const updatedProfile = await updateUserProfile(user.id, { [field]: value });
        setProfile(updatedProfile);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isViewUser = profile?.role === 'view_user';
  const isAccountAdmin = profile?.role === 'account_admin';
  const isSuperAdmin = profile?.role === 'super_admin';
  const isDemoUser = profile?.role === 'demo_user';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="hidden md:flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account preferences
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        
        {/* Subscription Section - Only for admin roles and demo */}
        {(isAccountAdmin || isSuperAdmin || isDemoUser) && (
          <SubscriptionSection />
        )}

        {/* Invite User Section - Only for admin roles and demo */}
        {(isAccountAdmin || isSuperAdmin || isDemoUser) && (
          <InviteUserSection onInvite={async () => {}} />
        )}

        {/* Profile Information */}
        <UserInfoSection
          firstName={profile?.first_name || ''}
          lastName={profile?.last_name || ''}
          address_line1={profile?.address_line1 || ''}
          address_line2={profile?.address_line2 || ''}
          city={profile?.city || ''}
          postcode={profile?.postcode || ''}
          role={profile?.role || 'view_user'}
          onUpdate={handleUpdate}
        />

        {/* Email Settings */}
        <EmailSection email={user?.email || ''} />

        {/* Password Section */}
        <PasswordSection />
        
      </div>
    </div>
  );
};

export default Settings;
