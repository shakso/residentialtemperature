import React from 'react';
import { Wifi } from 'lucide-react';
import { FormState } from '../data';

interface WifiStepProps {
  formState: FormState;
  setFormValue: (key: keyof FormState, value: any) => void;
  validationErrors: {[key: string]: string};
}

const WifiStep: React.FC<WifiStepProps> = ({ 
  formState, 
  setFormValue, 
  validationErrors 
}) => {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">WiFi Configuration</h3>
        <p className="text-sm text-gray-500">
          Your temperature sensors need to connect to your WiFi network. Would you like to configure this now?
        </p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div 
          className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
            formState.configureWifi === 'yes' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFormValue('configureWifi', 'yes')}
        >
          <div className="flex items-center">
            <Wifi className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Yes, configure WiFi now</h4>
              <p className="text-sm text-gray-500">
                Provide your WiFi details now for a quicker setup
              </p>
            </div>
          </div>
          {formState.configureWifi === 'yes' && (
            <div className="absolute top-2 right-2 h-4 w-4 bg-blue-500 rounded-full"></div>
          )}
        </div>
        
        <div 
          className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
            formState.configureWifi === 'no' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFormValue('configureWifi', 'no')}
        >
          <div className="flex items-center">
            <Wifi className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">No, I'll configure later</h4>
              <p className="text-sm text-gray-500">
                You can set up WiFi during installation
              </p>
            </div>
          </div>
          {formState.configureWifi === 'no' && (
            <div className="absolute top-2 right-2 h-4 w-4 bg-blue-500 rounded-full"></div>
          )}
        </div>
        
        {validationErrors.configureWifi && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.configureWifi}</p>
        )}
      </div>
      
      {formState.configureWifi === 'yes' && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label htmlFor="wifiSSID" className="block text-sm font-medium text-gray-700">
              WiFi Network Name (SSID)*
            </label>
            <div className="mt-1">
              <input
                id="wifiSSID"
                name="wifiSSID"
                type="text"
                required
                value={formState.wifiSSID}
                onChange={(e) => setFormValue('wifiSSID', e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border ${validationErrors.wifiSSID ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g. HomeWiFi"
              />
              {validationErrors.wifiSSID && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.wifiSSID}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="wifiPassword" className="block text-sm font-medium text-gray-700">
              WiFi Password*
            </label>
            <div className="mt-1">
              <input
                id="wifiPassword"
                name="wifiPassword"
                type="password"
                required
                value={formState.wifiPassword}
                onChange={(e) => setFormValue('wifiPassword', e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border ${validationErrors.wifiPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.wifiPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.wifiPassword}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmWifiPassword" className="block text-sm font-medium text-gray-700">
              Confirm WiFi Password*
            </label>
            <div className="mt-1">
              <input
                id="confirmWifiPassword"
                name="confirmWifiPassword"
                type="password"
                required
                value={formState.confirmWifiPassword}
                onChange={(e) => setFormValue('confirmWifiPassword', e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border ${validationErrors.confirmWifiPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {validationErrors.confirmWifiPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmWifiPassword}</p>
              )}
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-700">
              Your WiFi credentials will be securely stored and only used to configure your temperature sensors during installation.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WifiStep;
