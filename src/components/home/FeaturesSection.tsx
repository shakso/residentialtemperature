import React from 'react';
import { Thermometer, Shield, BarChart } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
          <Thermometer className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Smart Monitoring</h3>
          <p className="mt-2 text-gray-500">
            Automated temperature tracking and documentation that helps meet regulatory requirements for residential facilities.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
          <Shield className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Comfort & Compliance</h3>
          <p className="mt-2 text-gray-500">
            Keep common areas at optimal temperatures while maintaining proper documentation for inspections.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
          <BarChart className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Detailed Analytics</h3>
          <p className="mt-2 text-gray-500">
            Generate comprehensive reports with complete temperature history and trend analysis for your compliance records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
