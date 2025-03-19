import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, AlertCircle, CreditCard } from 'lucide-react';
import { createSubscription, confirmSubscriptionPayment } from '../../lib/stripe';

interface CheckoutFormProps {
  amount: number;
  planName: string;
  planId: string;
  email: string;
  firstName: string;
  lastName: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
  };
  onSuccess: (paymentId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  amount, 
  planName, 
  planId,
  email,
  firstName,
  lastName,
  address,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Get today's date
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  
  // Get day of week name and month name
  const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
  const monthName = today.toLocaleString('en-US', { month: 'long' });
  
  // Add ordinal suffix to day
  const getDayWithSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };
  
  const dayWithSuffix = getDayWithSuffix(day);
  const formattedDate = `${dayOfWeek} ${dayWithSuffix} ${monthName} ${year}`;

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // In a real implementation, we would create a subscription on the server
      // and return the client secret to confirm the payment
      const subscriptionResponse = await createSubscription({
        priceId: `price_${planId}`, // This would be a real Stripe price ID in production
        email,
        firstName,
        lastName,
        address: {
          ...address,
          country: 'GB' // Hardcoded for this example
        },
        metadata: {
          planId,
          planName
        }
      });

      setClientSecret(subscriptionResponse.clientSecret);

      // Get the card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create a payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${firstName} ${lastName}`,
          email,
          address: {
            line1: address.line1,
            line2: address.line2 || '',
            city: address.city,
            postal_code: address.postal_code,
            country: 'GB'
          }
        }
      });

      if (paymentMethodError) {
        throw paymentMethodError;
      }

      // Confirm the subscription payment
      const confirmResult = await confirmSubscriptionPayment(
        subscriptionResponse.clientSecret,
        paymentMethod.id
      );

      if (confirmResult.status === 'success') {
        setSucceeded(true);
        setSubscription(confirmResult.subscription);
        onSuccess(confirmResult.subscription.id);
      } else {
        throw new Error('Payment confirmation failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
          color: '#424770',
        },
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
    loader: 'auto'
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Subscription Summary</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Plan: {planName}</p>
              <p>Monthly fee: £{amount}</p>
              <p className="mt-1 font-medium">
                First Payment will be taken immediately and subscription will commence from {formattedDate}.
                <br />
                Payment of £{amount} will be taken on the {dayWithSuffix} of each month (or nearest working day).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Card Details
            </div>
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm relative">
            {stripe && elements ? (
              <CardElement options={cardElementOptions} />
            ) : (
              <div className="text-center py-4">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Loading payment form...</p>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your card will be charged immediately for the first month.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {succeeded ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-green-700">
                  <p className="font-medium">Payment successful!</p>
                  <p className="mt-1">Your subscription is now active. You'll be redirected to complete your registration.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stripe || processing}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Subscribe Now"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
