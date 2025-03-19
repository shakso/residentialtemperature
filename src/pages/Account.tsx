import React from 'react';
import ProfileSection from '../components/account/ProfileSection';
import EmailSection from '../components/account/EmailSection';
import PasswordSection from '../components/account/PasswordSection';
import AddressSection from '../components/account/AddressSection';
import BatterySection from '../components/account/BatterySection';

const Account = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <ProfileSection />
        <hr />
        <EmailSection />
        <hr />
        <PasswordSection />
        <hr />
        <AddressSection />
        <hr />
        <BatterySection />

        <div className="flex justify-end space-x-4 pt-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
