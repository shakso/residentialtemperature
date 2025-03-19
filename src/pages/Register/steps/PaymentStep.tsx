import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Check, Tag } from 'lucide-react';
import { createSubscription, confirmSubscriptionPayment } from '../../../lib/stripe';
import { FormState, Plan } from '../data';

interface PaymentStepProps {
  formState: FormState;
  selectedPlan: Plan;
  setFormValue: (key: keyof FormState, value: any) => void;
  onSuccess: (paymentId: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  validationErrors: {[key: string]: string};
}

const PaymentStep: React.FC<PaymentStepProps> = ({ 
  formState,
  selectedPlan,
  setFormValue,
  onSuccess,
  onProcessingChange,
  validationErrors
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        ':focus': {
          color: '#424770',
        },
      },
      invalid: {
        color: '#9e2146',
        ':focus': {
          color: '#9e2146',
        },
        '::placeholder': {
          color: '#9e2146',
        },
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || processing || succeeded) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    // Validate card element
    const { error: validateError } = await stripe.createToken(cardElement);
    if (validateError) {
      setError(validateError.message || 'Please check your card details');
      return;
    }

    setProcessing(true);
    onProcessingChange(true);
    setError(null);

    try {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${formState.firstName} ${formState.lastName}`,
          email: formState.email,
          address: {
            line1: formState.address1,
            line2: formState.address2 || undefined,
            city: formState.city,
            postal_code: formState.postcode,
            country: 'GB'
          }
        }
      });

      if (pmError) {
        throw pmError;
      }
      
      if (!paymentMethod?.id) {
        throw new Error('Failed to create payment method');
      }

      // Create subscription with validated payment method
      const subscriptionData = await createSubscription({
        priceId: selectedPlan.priceId,
        email: formState.email,
        couponCode: formState.couponCode,
        firstName: formState.firstName,
        lastName: formState.lastName,
        address: {
          line1: formState.address1,
          line2: formState.address2 || undefined,
          city: formState.city,
          postal_code: formState.postcode,
          country: 'GB'
        }
      });

      if (!subscriptionData?.clientSecret || !subscriptionData?.subscriptionId) {
        throw new Error('Invalid subscription response');
      }

      // Confirm the subscription payment
      const result = await confirmSubscriptionPayment(
        subscriptionData.clientSecret,
        paymentMethod.id
      );

      if (!result || result.status !== 'success') {
        throw new Error('Payment confirmation failed. Please check your card details and try again.');
      }

      // Clear any previous errors
      setError(null);

      // Mark payment as successful
      setSucceeded(true);
      onSuccess(subscriptionData.subscriptionId);
      cardElement.clear();

    } catch (err: any) {
      console.error('Payment error:', err);
      let errorMessage = err.message || 'An error occurred during payment processing. Please try again.';
      
      if (err.type === 'card_error' || err.type === 'validation_error') {
        errorMessage = err.message || 'Your card was declined. Please try a different card.';
      } else if (err.type === 'StripeInvalidRequestError') {
        errorMessage = 'Invalid payment details. Please check your information and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CreditCard className="mr-2" /> Payment Information
        </h3>
        <p className="text-sm text-gray-500">
          Enter your card details to start your subscription
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-blue-800">Subscription Summary</h4>
        <div className="mt-2 text-sm text-blue-700">
          <p>Plan: {selectedPlan.name}</p>
          <p>Monthly fee: £{selectedPlan.price}</p>
          <ul className="mt-2 space-y-1">
            {selectedPlan.features.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Coupon Code Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            Discount Code
          </div>
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={formState.couponCode}
            onChange={(e) => setFormValue('couponCode', e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {couponError && (
          <p className="mt-1 text-sm text-red-600">{couponError}</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
            <CardElement options={cardElementOptions} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Please ensure all card details are entered correctly
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium mb-1">Payment Error</p>
            {error}
            <p className="mt-1 text-sm">Please check your card details and try again.</p>
          </div>
        )}

        {succeeded ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Payment successful!</h3>
                <p className="mt-2 text-sm text-green-700">
                  Your subscription has been activated. Click continue to complete your registration.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stripe || processing || succeeded}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              "Subscribe Now"
            )}
          </button>
        )}
        {!succeeded && (
          <p className="mt-2 text-xs text-center text-gray-500">
            Payment processing may take up to a minute to complete
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
