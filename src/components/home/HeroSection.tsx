import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../lib/auth';

const HeroSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const demoCredentials = {
    email: 'demo@residentialtemperature.com',
    password: 'demo123'
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { user, error } = await loginUser(demoCredentials.email, demoCredentials.password);
      if (error) {
        throw new Error(error);
      }
      if (!user) {
        throw new Error('Failed to login as demo user');
      }
      navigate('/admin/sensors');
    } catch (err) {
      console.error('Demo login error:', err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block text-blue-500">residential</span>
            <span className="block text-orange-500">temperature</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl">
            Smart temperature monitoring for residential facilities. Keep your residents 
            comfortable with 24/7 monitoring, instant alerts, and automated reports that 
            help maintain compliance standards.
          </p>
          <div className="mt-8">
            <div className="flex space-x-4">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed md:text-lg"
              >
                {loading ? 'Loading...' : 'Try Demo'}
              </button>
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:text-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden shadow-xl">
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source 
              src="https://jiablavyvojfiecxqury.supabase.co/storage/v1/object/sign/images/vecteezy_hd-bars-and-tone_2018013.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvdmVjdGVlenlfaGQtYmFycy1hbmQtdG9uZV8yMDE4MDEzLm1wNCIsImlhdCI6MTc0MDA3MTQxNywiZXhwIjoxNzcxNjA3NDE3fQ.AEY1CLxL8YO90jWOO72TJKsI1yDh9OYGoV7noApubQw" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
