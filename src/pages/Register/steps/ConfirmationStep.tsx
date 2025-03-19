import React from 'react';
import { Check } from 'lucide-react';
import { Plan } from '../data';

interface ConfirmationStepProps {
  formState: {
    firstName: string;
    lastName: string;
    email: string;
    address1: string;
    address2?: string;
    city: string;
    postcode: string;
  };
  selectedPlan: Plan;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  formState,
  selectedPlan
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <Check className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-green-900">Registration Complete!</h3>
        <p className="mt-2 text-green-700">
          Your account has been successfully created and your welcome email is on its way.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Plan Details</h4>
          <p className="text-gray-600">{selectedPlan.name} - £{selectedPlan.price}/month</p>
          <ul className="mt-2 space-y-1">
            {selectedPlan.features.map((feature, index) => (
              <li key={index} className="text-sm text-gray-500">• {feature}</li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900">Delivery Details</h4>
          <p className="text-gray-600">
            {formState.firstName} {formState.lastName}<br />
            {formState.address1}<br />
            {formState.address2 && <>{formState.address2}<br /></>}
            {formState.city}<br />
            {formState.postcode}<br />
            <br />
            Your package will be dispatched in 3-5 working days.<br />
            We will send out a tracking number once dispatched.
          </p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900">Welcome Email</h4>
          <p className="text-gray-600">
            We've sent a welcome email to {formState.email} with:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            <li>• Your account details</li>
            <li>• Getting started guides</li>
            <li>• Delivery information</li>
            <li>• Support contact details</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            navigate('/admin/sensors');
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Click "Go to Dashboard" to access your account.
      </p>
    </div>
  );
};

export default ConfirmationStep;
