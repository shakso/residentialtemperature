import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export async function isEmailRegistered(email: string): Promise<{ isRegistered: boolean; error?: string }> {
  try {
    // Use Supabase function to check if email exists
    const { data, error } = await supabase.rpc('check_email_exists', { email_to_check: email });
    
    if (error) throw error;
    
    return { isRegistered: data || false };
  } catch (err: any) {
    console.error('Error checking email:', err);
    return { isRegistered: false, error: err.message };
  }
}

export async function registerUser(
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<{ user?: User; error?: string }> {
  try {
    // Validate inputs
    if (!email?.trim()) {
      return { error: 'Email is required' };
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return { error: 'Please enter a valid email address' };
    }
    if (!password) {
      return { error: 'Password is required' };
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    // Check if email already exists
    const { data: emailExists, error: checkError } = await supabase
      .rpc('check_email_exists', { email_to_check: email.trim() });
    
    if (checkError) {
      console.error('Error checking email:', checkError);
      throw new Error('Failed to verify email availability');
    }
    
    if (emailExists) {
      return { error: 'Email already registered' };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName?.trim() || '',
          last_name: lastName?.trim() || ''
        },
        emailRedirectTo: `${window.location.origin}/login`,
        emailConfirmation: false
      }
    }
    )
    // Wait for profile creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        first_name: firstName?.trim(),
        last_name: lastName?.trim()
      }
    };
  } catch (err: any) {
    console.error('Error registering user:', err);
    return { 
      error: err.message || 'Registration failed. Please try again.'
    };
  }
}

export async function loginUser(
  email: string, 
  password: string
): Promise<{ user?: User; token?: string; error?: string }> {
  try {
    // Validate and normalize inputs
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      return { error: 'Email is required' };
    }
    if (!password) {
      return { error: 'Password is required' };
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user || !data.session) {
      throw new Error('Invalid login credentials');
    }
    
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', data.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for new users
      console.error('Error fetching profile:', profileError);
    }
    
    return { 
      user: {
        id: data.user.id,
        email: data.user.email || '',
        first_name: profileData?.first_name || data.user.user_metadata?.first_name,
        last_name: profileData?.last_name || data.user.user_metadata?.last_name
      },
      token: data.session.access_token
    };
  } catch (err: any) {
    console.error('Error logging in user:', err);
    return { error: err.message || 'Failed to sign in. Please try again.' };
  }
}

export async function validateToken(token: string): Promise<{ user?: User; error?: string }> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error(sessionError.message);
    }
    
    if (!session) {
      throw new Error('No valid session found');
    }
    
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', session.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }
    
    return { 
      user: {
        id: session.user.id,
        email: session.user.email || '',
        first_name: profileData?.first_name || session.user.user_metadata?.first_name,
        last_name: profileData?.last_name || session.user.user_metadata?.last_name
      }
    };
  } catch (err: any) {
    console.error('Error validating token:', err);
    return { error: err.message };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if demo user
    if (email === 'demo@residentialtemperature.com') {
      return {
        success: false,
        error: 'Cannot reset password in Demo mode'
      };
    }

    // Send password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    );
    
    if (error) {
      console.error('Reset email error:', error);
      
      // Handle specific error cases
      if (error.message === 'unexpected_failure') {
        return {
          success: false,
          error: 'Unable to send reset email at this time. Please try again later.'
        };
      }
      
      if (error.status === 429) {
        return {
          success: false,
          error: 'Too many attempts. Please wait a few minutes before trying again.'
        };
      }
      
      // For all other errors, return a generic message for security
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error sending password reset email:', err);

    // Return error for better user feedback
    return {
      success: false,
      error: 'Failed to send reset email. Please try again.'
    };
  }
}

export async function resetPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if demo user
    const { data: demoCheck, error: demoError } = await supabase.rpc('is_demo_user');
    if (demoError) throw demoError;
    if (demoCheck) {
      return { 
        success: false, 
        error: 'Cannot modify password in Demo mode' 
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error);
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to reset password. Please try again.' 
    };
  }
}
