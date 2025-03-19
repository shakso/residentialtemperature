import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../lib/auth';
import AuthForm from '../components/auth/AuthForm';
import { Mail, Check, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const { success, error: resetError } = await sendPasswordResetEmail(trimmedEmail);

      if (!success) {
        throw new Error(resetError);
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(
        err.message === 'Invalid login credentials' 
          ? 'No account found with this email address'
          : err.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Reset your password"
      buttonText="Send reset link"
      loadingText="Sending..."
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
              <h3 className="text-sm font-medium text-green-800">Password reset email sent</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  If an account exists with <strong>{email.trim()}</strong>, you will receive password reset instructions shortly. Please check your email (including spam folder).
                </p>
              </div>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-center bg-blue-50 h-12 w-12 rounded-full mx-auto">
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
            <p className="mt-3 text-sm text-gray-600 text-center">
              Enter your email address and we'll send you password reset instructions if an account exists.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </>
      )}
    </AuthForm>
  );
};

export default ForgotPassword;
