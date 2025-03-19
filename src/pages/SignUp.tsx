import React from 'react';
import { Link } from 'react-router-dom';
import HomeNavbar from '../components/navigation/HomeNavbar';
import PlansSection from '../components/home/PlansSection';
import Footer from '../components/Footer';

const SignUp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <HomeNavbar showSignUp={false} />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Select the perfect monitoring solution for your property
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:text-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <PlansSection />
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
