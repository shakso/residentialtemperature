import React, { useState } from 'react';
import { X, Settings, Check, XCircle } from 'lucide-react';
import { useCookies } from '../../context/CookieContext';

const CookieBanner = () => {
  const { 
    preferences, 
    showBanner, 
    updatePreferences, 
    acceptAll, 
    rejectAll, 
    hideBanner 
  } = useCookies();
  
  const [showDetails, setShowDetails] = useState(false);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        {showDetails ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Necessary Cookies</h4>
                  <p className="text-sm text-gray-500">
                    Required for the website to function properly.
                  </p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                  Always Active
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-gray-500">
                    Help us improve our website by collecting usage information.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => updatePreferences({ analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <p className="text-sm text-gray-500">
                    Used to deliver more relevant advertisements.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreferences({ marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={rejectAll}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <XCircle size={16} className="mr-2" />
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Check size={16} className="mr-2" />
                Accept All
              </button>
              <button
                onClick={hideBanner}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Check size={16} className="mr-2" />
                Save Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Settings size={16} className="mr-2" />
                Preferences
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
