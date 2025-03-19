import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../lib/auth';
import { supabase } from '../lib/supabase';
import AuthForm from '../components/auth/AuthForm';
import { Lock, Check, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a session from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      // We have a valid recovery flow
      console.log('Valid recovery flow detected');
    } else {
      // No valid recovery flow, redirect to forgot password
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);

      const { data, error } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Set new password"
      buttonText="Reset password"
      loadingText="Resetting..."
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      alternateText="Remember your password?"
      alternateLinkText="Sign in"
      alternateLinkPath="/login"
    >
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Password reset successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your password has been successfully reset. You will be redirected to the login page in a few seconds.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Go to login now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-center bg-blue-50 h-12 w-12 rounded-full mx-auto">
              <Lock className="h-6 w-6 text-blue-500" />
            </div>
            <p className="mt-3 text-sm text-gray-600 text-center">
              Create a new password for your account.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </>
      )}
    </AuthForm>
  );
};

export default ResetPassword;
