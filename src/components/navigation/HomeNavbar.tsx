import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, Menu, X } from 'lucide-react';

interface HomeNavbarProps {
  showFAQ?: boolean;
  showSignUp?: boolean;
}

const HomeNavbar: React.FC<HomeNavbarProps> = ({ 
  showFAQ = true, 
  showSignUp = true 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center hover:opacity-75 transition-opacity">
            <Thermometer className="h-8 w-8 text-gray-500" />
            <div className="ml-1.5 flex flex-col">
              <span className="text-logo font-bold text-blue-500">residential</span>
              <span className="text-logo font-bold text-orange-500">temperature</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            {showFAQ && (
              <Link
                to="/faq"
                className="hidden md:block px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                FAQ
              </Link>
            )}
            <Link
              to="/contact"
              className="hidden md:block px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              Contact
            </Link>
            {showSignUp && (
              <Link
                to="/sign-up"
                className="hidden md:block px-4 py-2 rounded-md text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            )}
            <Link
              to="/login"
              className="hidden md:block px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
          {showFAQ && (
            <Link
              to="/faq"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
          )}
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {showSignUp && (
            <Link
              to="/sign-up"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          )}
          <Link
            to="/login"
            className="block px-3 py-2 rounded-md text-base font-medium bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
