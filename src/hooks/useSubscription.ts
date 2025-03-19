import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../lib/api';
import { supabase } from '../lib/supabase';
import { plans } from '../pages/Register/data';

interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  price: number;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

export function useSubscription() {
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    async function fetchSubscription() {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get user profile
        const profile = await getUserProfile(user.id);

        // Get plan details from profile
        const planDetails = plans.find(p => p.id === profile.subscription_plan) || plans[0];
        
        setSubscription({
          id: profile.subscription_id || '',
          status: profile.subscription_status || 'active',
          plan: profile.subscription_plan,
          price: planDetails?.price || 0,
          current_period_end: profile.subscription_period_end,
          cancel_at_period_end: Boolean(profile.subscription_cancel_at_period_end)
        });

      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user, token]);

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user || !subscription) return false;
    
    if (!subscription.id) {
      setError('Invalid subscription ID');
      return false;
    }
    
    setRetryCount(0);

    let success = false;
    try {
      setLoading(true);
      setError(null);

      const makeRequest = async () => {
        const response = await fetch(`/api/stripe/subscriptions/${subscription.id}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to cancel subscription: ${response.statusText}`);
        }
        
        return response;
      };

      let response;
      while (retryCount < MAX_RETRIES) {
        try {
          response = await makeRequest();
          break;
        } catch (err) {
          if (retryCount === MAX_RETRIES - 1) throw err;
          setRetryCount(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        }
      }

      if (!response) {
        throw new Error('Failed to cancel subscription after multiple retries');
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      if (!result || typeof result.current_period_end !== 'number') {
        throw new Error('Invalid response format from server');
      }

      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_cancel_at_period_end: true,
          subscription_period_end: new Date(result.current_period_end * 1000).toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('Failed to update subscription status');
      }
      
      // Update subscription state
      if (result.cancel_at_period_end) {
        setSubscription(prev => prev ? {
          ...prev,
          cancel_at_period_end: true,
          current_period_end: new Date(result.current_period_end * 1000).toISOString()
        } : null);
        
        success = true;
      }

      return success;
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateSubscription = async (newPlan: string): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      setLoading(true);
      setError(null);
      
      const planDetails = plans.find(p => p.id === newPlan);
      if (!planDetails) {
        throw new Error('Invalid plan selected');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: newPlan,
          subscription_status: 'active',
          subscription_cancel_at: null
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setSubscription(prev => prev ? {
        ...prev,
        plan: newPlan,
        price: planDetails.price,
        status: 'active',
        cancel_at_period_end: false
      } : null);

      return true;
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    cancelSubscription,
    updateSubscription
  };
}
