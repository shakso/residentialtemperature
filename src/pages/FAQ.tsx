import React from 'react';
import { HelpCircle } from 'lucide-react';
import HomeNavbar from '../components/navigation/HomeNavbar';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const FAQ = () => {
  useEffect(() => {
    document.title = 'FAQ | residential temperature';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <HomeNavbar showFAQ={false} />

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Have a different question? Contact our support team.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="flex items-center">
                <HelpCircle className="h-6 w-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">What is a gateway?</h3>
              </div>
              <p className="mt-4 text-gray-600">
                A gateway is a central hub that collects data from multiple sensors and securely transmits it to our cloud platform. It ensures reliable communication and extends the range of your sensor network.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="flex items-center">
                <HelpCircle className="h-6 w-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">How accurate are the sensors?</h3>
              </div>
              <p className="mt-4 text-gray-600">
                Our temperature sensors are highly accurate with a precision of ±0.5°C. They are calibrated and tested before installation to ensure reliable measurements.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="flex items-center">
                <HelpCircle className="h-6 w-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">What's included in the subscription?</h3>
              </div>
              <p className="mt-4 text-gray-600">
                All subscriptions include hardware (sensors and gateways), software access, real-time monitoring, alerts, analytics, and technical support. Installation and setup are also included.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="flex items-center">
                <HelpCircle className="h-6 w-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">How long is the contract?</h3>
              </div>
              <p className="mt-4 text-gray-600">
                Our standard contracts are 12 months, but we offer flexible terms for custom plans. You can upgrade your plan at any time to accommodate your growing needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
