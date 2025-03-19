import React from 'react';
import HomeNavbar from '../components/navigation/HomeNavbar';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const Privacy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | residential temperature';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <HomeNavbar showFAQ={false} showSignUp={false} />

      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-8">
              At Residential Temperature, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Account information (name, email, address)</li>
              <li>Temperature and humidity data from sensors</li>
              <li>Device performance metrics</li>
              <li>Usage data from our web application</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              Your information is used to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Provide monitoring services</li>
              <li>Generate analytics and reports</li>
              <li>Improve our services</li>
              <li>Send important notifications</li>
              <li>Process payments</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-600 mb-4">
              We use industry-standard security measures to protect your data. All data is encrypted during transmission and storage. We regularly review and update our security practices.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
              <li>Third parties with your explicit consent</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For privacy-related questions or concerns, please contact our Data Protection Officer at privacy@residentialtemperature.com
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
