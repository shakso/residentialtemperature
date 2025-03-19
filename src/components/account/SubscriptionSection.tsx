import React, { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { isDemoUser } from '../../lib/api';
import Toast from '../ui/Toast'; 
import { format, subDays } from 'date-fns';

const SubscriptionSection = () => {
  const { subscription, loading, error, cancelSubscription } = useSubscription();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  
  // Get renewal day of month
  const getRenewalDay = () => {
    if (!subscription?.current_period_end) return null;
    const renewalDate = new Date(subscription.current_period_end);
    const day = renewalDate.getDate();
    
    // Add ordinal suffix
    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return `${n}th`;
      switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
      }
    };
    
    return getOrdinal(day);
  };

  // Check demo status on mount
  React.useEffect(() => {
    isDemoUser().then(demo => setIsDemo(demo));
  }, []);
  
  const handleCancelClick = () => {
    if (isDemo) {
      setLocalError("Can't cancel subscription in demo mode");
      return;
    }
    setShowConfirmCancel(true);
  };

  const handleConfirmCancel = async () => {
    if (isDemo) {
      setLocalError("Can't cancel subscription in demo mode");
      setShowConfirmCancel(false);
      return;
    }
    const success = await cancelSubscription();
    if (success) {
      setLocalError('Subscription cancelled successfully');
    } else {
      setLocalError('Failed to cancel subscription');
    }
    setShowConfirmCancel(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <CreditCard className="mr-2" /> Subscription
      </h2>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : subscription ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {subscription.plan} Plan
                  <p className="mt-1 text-sm text-gray-500">
                    £{subscription.price}/month
                  </p>
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your subscription renews on the {getRenewalDay()} of each month
                </p>
              </div>
              <span className={`px-2 py-1 text-sm rounded-full ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.status}
              </span>
            </div>
            <hr className="my-4 border-gray-200" />

            {subscription.cancel_at_period_end && (
              <div className="p-4 bg-yellow-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Subscription Cancellation Scheduled
                    </h3> 
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Your subscription will expire on{' '}
                        {format(subDays(new Date(subscription.current_period_end), 1), 'EEEE do MMMM yyyy')}
                      </p>
                      <p className="mt-2">
                        A return package will be sent to you for returning the gateways and sensors. 
                        Please ensure all equipment is returned before your subscription expires to avoid additional charges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!subscription.cancel_at_period_end && (
              !isDemo && <div className="mt-4 flex justify-end">
                {showConfirmCancel ? (
                  <div className="space-x-4 flex items-center">
                    <div className="text-sm text-gray-600 mr-4">
                      Your subscription will expire on{' '}
                      {format(subDays(new Date(subscription.current_period_end), 1), 'EEEE do MMMM yyyy')}
                    </div>
                    <button
                      onClick={() => setShowConfirmCancel(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      No, keep my subscription
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Yes, Cancel Subscription
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCancelClick}
                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No subscription found</div>
      )}

      {(error || localError) && (
        <Toast
          message={error || localError}
          type={localError?.includes("Can't") ? 'error' : 'success'}
          onClose={() => {
            setLocalError(null);
          }} 
          duration={3000}
        />
      )}
    </div>
  );
};

export default SubscriptionSection;
