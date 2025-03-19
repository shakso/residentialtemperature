import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, ArrowLeft } from 'lucide-react';

interface AuthFormProps extends React.PropsWithChildren {
  title: string;
  buttonText: string;
  loadingText: string;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  alternateText: string;
  alternateLinkText: string;
  alternateLinkPath: string;
  showSteps?: boolean;
  currentStep?: number;
  totalSteps?: number;
  showBackButton?: boolean;
  onBack?: () => void;
  stepLabels?: string[];
  onStepClick?: (step: number) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  buttonText,
  loadingText,
  error,
  loading,
  onSubmit,
  alternateText,
  alternateLinkText,
  alternateLinkPath,
  children,
  showSteps = false,
  currentStep = 1,
  totalSteps = 1,
  showBackButton = false,
  onBack,
  stepLabels = [],
  onStepClick
}) => {
  const [progressWidth, setProgressWidth] = useState(0);
  const [progressLeft, setProgressLeft] = useState(0);
  const stepsContainerRef = React.useRef<HTMLDivElement>(null);
  const stepRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Calculate progress line position based on actual button positions
  const updateProgressLine = React.useCallback(() => {
    if (!stepsContainerRef.current) {
      setProgressWidth(0);
      setProgressLeft(0);
      return;
    }

    const container = stepsContainerRef.current;
    const containerLeft = container.getBoundingClientRect().left;
    
    const firstStep = stepRefs.current[0];
    const currentStepEl = stepRefs.current[Math.min(currentStep - 1, totalSteps - 1)];
    
    if (!firstStep || !currentStepEl) return;

    const firstStepRect = firstStep.getBoundingClientRect();
    const currentStepRect = currentStepEl.getBoundingClientRect();
    
    const startX = firstStepRect.left + (firstStepRect.width / 2) - containerLeft;
    const endX = currentStepRect.left + (currentStepRect.width / 2) - containerLeft;
    
    setProgressLeft(startX);
    setProgressWidth(endX - startX);
  }, [currentStep, totalSteps]);

  // Update line position on mount and when step changes
  React.useEffect(() => {
    updateProgressLine();
    window.addEventListener('resize', updateProgressLine);
    return () => window.removeEventListener('resize', updateProgressLine);
  }, [updateProgressLine]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center hover:opacity-75 transition-opacity">
          <Thermometer className="h-12 w-12 text-gray-500" />
          <div className="ml-1.5 flex flex-col">
            <span className="text-logo font-bold text-blue-500">residential</span>
            <span className="text-logo font-bold text-orange-500">temperature</span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {showSteps && (
          <div className="px-4 mb-8 flex justify-center">
            <div className="flex items-center justify-between relative" ref={stepsContainerRef}>
              {/* Continuous horizontal line that connects all circles */}
              <div className="absolute top-4 h-1" style={{ left: '32px', right: '32px' }}>
                <div className="absolute inset-0 bg-gray-200" />
              </div>
              
              {/* Progress line */}
              <div 
                className="absolute top-4 h-1 bg-blue-500 transition-all duration-300"
                style={{ 
                  left: progressLeft,
                  width: progressWidth,
                  zIndex: 1
                }}
              ></div>
              
              {/* Step circles and labels */}
              <div className="flex justify-between relative" style={{ width: '450px' }}>
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                  const isActive = step <= Math.min(currentStep, totalSteps);
                  return (
                    <div key={step} className="flex flex-col items-center" style={{ zIndex: 2, width: '64px' }}>
                      {/* Step circle */}
                      <button
                        type="button"
                        ref={el => stepRefs.current[step - 1] = el}
                        onClick={() => onStepClick && step <= currentStep ? onStepClick(step) : null}
                        disabled={step > currentStep}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {step}
                      </button>
                      
                      {/* Step label - split into two lines if needed */}
                      {stepLabels.length > 0 && (
                        <div className="text-center mt-1">
                          {stepLabels[step-1].split('\n').map((line, i) => (
                            <span key={i} className="text-xs text-gray-500 leading-tight block">
                              {line}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>
          )}
          
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {children}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? loadingText : buttonText}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {alternateText}{' '}
                  <Link to={alternateLinkPath} className="font-medium text-blue-600 hover:text-blue-500">
                    {alternateLinkText}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
