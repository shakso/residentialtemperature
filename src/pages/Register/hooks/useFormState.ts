import { useState, useEffect } from 'react';
import { FormState } from '../data';
import { isEmailRegistered } from '../../../lib/auth';

export function useFormState() {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    addressQuery: '',
    selectedPlan: 'medium',
    configureWifi: null,
    wifiSSID: '',
    wifiPassword: '',
    confirmWifiPassword: '',
    termsAccepted: false,
    couponCode: '',
    paymentId: null
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Set a single form value
  const setFormValue = (key: keyof FormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Check if email is already registered when it changes
  useEffect(() => {
    // Only check if email is valid
    if (!formState.email || !formState.email.includes('@') || !formState.email.includes('.')) {
      return;
    }
    
    // Debounce the check to avoid too many requests
    const emailCheckTimeout = setTimeout(async () => {
      if (formState.email && formState.email.includes('@') && formState.email.includes('.')) {
        setCheckingEmail(true);
        try {
          // Use our helper function to check if email exists
          const { isRegistered } = await isEmailRegistered(formState.email);
          setEmailExists(isRegistered);
          
          if (isRegistered) {
            setValidationErrors(prev => ({
              ...prev,
              email: 'This email is already registered. Please use a different email or sign in.'
            }));
          } else {
            // Only clear the "already registered" error, keep other email errors if they exist
            setValidationErrors(prev => {
              const newErrors = { ...prev };
              if (newErrors.email === 'This email is already registered. Please use a different email or sign in.') {
                delete newErrors.email;
              }
              return newErrors;
            });
          }
        } catch (err) {
          // Silently handle errors - don't show to user
          console.error('Error checking email:', err);
        } finally {
          setCheckingEmail(false);
        }
      }
    }, 800); // Longer debounce to reduce API calls

    return () => clearTimeout(emailCheckTimeout);
  }, [formState.email]);

  const validateStep = async (currentStep: number) => {
    const errors: {[key: string]: string} = {};
    
    if (currentStep === 1) {
      if (!formState.firstName.trim()) errors.firstName = 'First name is required';
      if (!formState.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formState.email.trim()) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formState.email)) errors.email = 'Email is invalid';
      else if (emailExists) errors.email = 'This email is already registered. Please use a different email or sign in.';
      
      if (!formState.password) errors.password = 'Password is required';
      else if (formState.password.length < 8) errors.password = 'Password must be at least 8 characters';
      
      if (!formState.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (formState.password !== formState.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    if (currentStep === 2) {
      if (!formState.address1.trim()) errors.address1 = 'Address line 1 is required';
      if (!formState.city.trim()) errors.city = 'City is required';
      if (!formState.postcode.trim()) errors.postcode = 'Postcode is required';
    }
    
    if (currentStep === 3) {
      if (formState.configureWifi === null) errors.configureWifi = 'Please select an option';
      
      if (formState.configureWifi === 'yes') {
        if (!formState.wifiSSID.trim()) errors.wifiSSID = 'WiFi name is required';
        if (!formState.wifiPassword) errors.wifiPassword = 'WiFi password is required';
        if (!formState.confirmWifiPassword) errors.confirmWifiPassword = 'Please confirm WiFi password';
        else if (formState.wifiPassword !== formState.confirmWifiPassword) errors.confirmWifiPassword = 'WiFi passwords do not match';
      }
    }
    
    if (currentStep === 4) {
      if (!formState.termsAccepted) errors.termsAccepted = 'You must accept the terms of service to continue';
    }
    
    if (currentStep === 5) {
      if (!formState.selectedPlan) errors.plan = 'Please select a plan';
    }
    
    if (currentStep === 6) {
      if (!formState.paymentId) errors.payment = 'Payment information is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    formState,
    setFormState,
    setFormValue,
    validationErrors,
    setValidationErrors,
    checkingEmail,
    emailExists,
    validateStep
  };
}
