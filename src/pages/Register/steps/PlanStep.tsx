import React from 'react';
import { Check } from 'lucide-react';
import { FormState, Plan } from '../data';

interface PlanStepProps {
  formState: FormState;
  setFormValue: (key: keyof FormState, value: any) => void;
  validationErrors: {[key: string]: string};
  plans: Plan[];
}

const PlanStep: React.FC<PlanStepProps> = ({ 
  formState, 
  setFormValue, 
  validationErrors,
  plans
}) => {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Select Your Plan</h3>
        <p className="text-sm text-gray-500">Choose the plan that best fits your needs</p>
      </div>
      
      <div className="space-y-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
              formState.selectedPlan === plan.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormValue('selectedPlan', plan.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{plan.name}</h4>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <ul className="mt-2 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check size={16} className="text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-gray-900">£{plan.price}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
            </div>
            {formState.selectedPlan === plan.id && (
              <div className="absolute top-2 right-2 h-4 w-4 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
        
        {validationErrors.plan && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.plan}</p>
        )}
      </div>
    </>
  );
};

export default PlanStep;
