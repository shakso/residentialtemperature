import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';

declare global {
  interface Window {
    ENV?: {
      VITE_STRIPE_PUBLISHABLE_KEY: string;
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

const getStripeKey = (): string => {
  // Check if we have environment variables in window.ENV (for production)
  if (window.ENV?.VITE_STRIPE_PUBLISHABLE_KEY) {
    return window.ENV.VITE_STRIPE_PUBLISHABLE_KEY;
  }
  
  // Fallback to environment variable
  return 'pk_test_51QmzekEAgypXY6TnmJCfsGnuVVjlntJb0iF9R6CGZd2fHtNIEgjdWV9iFbB1qvtsUForDWMe9xR3f8XdePBCD1Qx00YZ4vhaEB';
};

const stripePromise = loadStripe(getStripeKey());

const STRIPE_API_URL = '/api/stripe';

export interface CreateSubscriptionParams {
  priceId: string;
  email?: string;
  firstName: string;
  lastName: string;
  couponCode?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
}

export { stripePromise };

export async function createSubscription(params: CreateSubscriptionParams) {
  try {
    // Validate required parameters
    if (!params.priceId) {
      throw new Error('Price ID is required');
    }
    
    if (!params.email || !params.firstName || !params.lastName) {
      throw new Error('Customer details are required');
    }
    
    if (!params.address?.line1 || !params.address?.city || !params.address?.postal_code) {
      throw new Error('Billing address is required');
    }
    
    // Add coupon to request if provided
    const requestBody = {
      ...params,
      couponCode: params.couponCode?.trim()
    };

    const response = await fetch(`${STRIPE_API_URL}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Network error while creating subscription');
      }
      throw new Error(data.error?.message || 'Failed to create subscription');
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Invalid response from subscription server');
    }
    
    if (!data.clientSecret || !data.subscriptionId) {
      throw new Error('Invalid subscription response from server');
    }

    return {
      subscriptionId: data.subscriptionId,
      clientSecret: data.clientSecret
    };
  } catch (err: any) {
    console.error('Error creating subscription:', err);
    throw err;
  }
}

export async function confirmSubscriptionPayment(clientSecret: string, paymentMethodId: string) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe failed to initialize. Please refresh and try again.');
  }
  
  try {
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId
    });

    if (error) {
      throw error;
    }

    if (!paymentIntent) {
      throw new Error('Payment confirmation failed. Please try again.');
    }

    // Return success with subscription details
    return {
      status: 'success',
      subscription: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret
      }
    };
  } catch (err: any) {
    console.error('Payment confirmation error:', err);
    throw err;
  }
}
