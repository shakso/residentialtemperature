import React from 'react';
import HomeNavbar from '../components/navigation/HomeNavbar';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const Terms = () => {
  useEffect(() => {
    document.title = 'Terms of Service | residential temperature';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <HomeNavbar showFAQ={false} showSignUp={false} />

      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-blue max-w-none">
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using the Residential Temperature monitoring service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Service Description</h2>
            <p className="text-gray-600 mb-4">
              Residential Temperature provides temperature and humidity monitoring services through sensor devices and a web-based dashboard. The service includes hardware installation, maintenance, and data analytics.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Subscription and Payment</h2>
            <p className="text-gray-600 mb-4">
              Services are provided on a subscription basis. Payment terms are based on the selected plan and are billed monthly or annually. All fees are non-refundable unless otherwise specified.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Equipment and Installation</h2>
            <p className="text-gray-600 mb-4">
              All monitoring equipment remains the property of Residential Temperature. Users agree to provide reasonable access for installation, maintenance, and removal of equipment.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Collection and Usage</h2>
            <p className="text-gray-600 mb-4">
              We collect temperature, humidity, and device performance data. This data is used to provide monitoring services and improve our service quality. For more information, see our Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Service Availability</h2>
            <p className="text-gray-600 mb-4">
              While we strive for 100% uptime, we do not guarantee uninterrupted service. We will make reasonable efforts to notify users of any planned maintenance or service interruptions.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Termination</h2>
            <p className="text-gray-600 mb-4">
              Either party may terminate the service with 30 days written notice. Upon termination, users agree to return all equipment in good working condition.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              Residential Temperature is not liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
