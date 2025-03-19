import React from 'react';
import { Settings } from 'lucide-react';
import { useCookies } from '../../context/CookieContext';

const CookieSettings = () => {
  const { showPreferences } = useCookies();

  return (
    <button
      onClick={showPreferences}
      className="flex items-center text-gray-600 hover:text-gray-900"
    >
      <Settings size={16} className="mr-2" />
      Cookie Settings
    </button>
  );
};

export default CookieSettings;
