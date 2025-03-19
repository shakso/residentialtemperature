import React from 'react';
import { FormState } from '../data';
import { FileText } from 'lucide-react';

interface TermsStepProps {
  formState: FormState;
  setFormValue: (key: keyof FormState, value: any) => void;
  validationErrors: {[key: string]: string};
}

const TermsStep: React.FC<TermsStepProps> = ({
  formState,
  setFormValue,
  validationErrors
}) => {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="mr-2" /> Terms of Service
        </h3>
        <p className="text-sm text-gray-500">
          Please read and accept our terms of service to continue
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="h-64 overflow-y-auto prose prose-sm max-w-none mb-4 text-gray-600">
          <h4>1. Acceptance of Terms</h4>
          <p>
            By accessing and using the Residential Temperature monitoring service, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>

          <h4>2. Service Description</h4>
          <p>
            Residential Temperature provides temperature and humidity monitoring services through sensor devices and a web-based dashboard.
            The service includes hardware installation, maintenance, and data analytics.
          </p>

          <h4>3. Subscription and Payment</h4>
          <p>
            Services are provided on a subscription basis. Payment terms are based on the selected plan and are billed monthly.
            All fees are non-refundable unless otherwise specified.
          </p>

          <h4>4. Equipment and Installation</h4>
          <p>
            All monitoring equipment remains the property of Residential Temperature.
            Users agree to provide reasonable access for installation, maintenance, and removal of equipment.
          </p>

          <h4>5. Data Collection and Usage</h4>
          <p>
            We collect temperature, humidity, and device performance data.
            This data is used to provide monitoring services and improve our service quality.
          </p>

          <h4>6. Service Availability</h4>
          <p>
            While we strive for 100% uptime, we do not guarantee uninterrupted service.
            We will make reasonable efforts to notify users of any planned maintenance or service interruptions.
          </p>

          <h4>7. Termination</h4>
          <p>
            Either party may terminate the service with 30 days written notice.
            Upon termination, users agree to return all equipment in good working condition.
          </p>

          <h4>8. Limitation of Liability</h4>
          <p>
            Residential Temperature is not liable for any indirect, incidental, or consequential damages
            arising from the use or inability to use our services.
          </p>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formState.termsAccepted}
            onChange={(e) => setFormValue('termsAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            I have read and agree to the Terms of Service
          </label>
        </div>
        {validationErrors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600">{validationErrors.termsAccepted}</p>
        )}
      </div>
    </>
  );
};

export default TermsStep;
