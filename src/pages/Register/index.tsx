import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import { isEmailRegistered } from '../../lib/auth';
import { emailService } from '../../lib/services/emailService';
import AuthForm from '../../components/auth/AuthForm';
import AccountStep from './steps/AccountStep';
import AddressStep from './steps/AddressStep';
import WifiStep from './steps/WifiStep';
import TermsStep from './steps/TermsStep';
import PlanStep from './steps/PlanStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';
import { plans } from './data';
import { useFormState } from './hooks/useFormState';
import { registerUser } from '../../lib/auth';
import InvitedUserStep from './steps/InvitedUserStep';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('invite');
  const { 
    formState, 
    setFormValue, 
    validationErrors, 
    setValidationErrors,
    checkingEmail,
    validateStep
  } = useFormState();
  
  useEffect(() => {
    document.title = 'Register | residential temperature';
  }, []);

  const [invitationData, setInvitationData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!inviteId) return;

      try {
        const { data, error } = await supabase
          .from('user_invitations')
          .select('id, email, role, invited_by')
          .eq('id', inviteId)
          .is('accepted_at', null)
          .single();

        if (error) throw error;
        if (!data) {
          throw new Error('This invitation is invalid or has already been used');
        }

        setInvitationData(data);
      } catch (err: any) {
        console.error('Error fetching invitation:', err);
        setError(
          err.message === 'JSON object requested, multiple (or no) rows returned'
            ? 'This invitation is invalid or has already been used'
            : err.message
        );
      }
    };

    fetchInvitation();
  }, [inviteId]);

  const handleInvitedUserSubmit = async (password: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required');
        return;
      }

      if (!password || password.length < 8) {
        setError('Password is required');
        return;
      }

      if (!invitationData?.email) {
        throw new Error('Invalid invitation data');
      }

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email.trim(),
        password: password.trim(),
        options: { 
          data: { 
            first_name: firstName.trim(), 
            last_name: lastName.trim() 
          },
          emailRedirectTo: `${window.location.origin}/login`
        } 
      }); 

      if (signUpError) throw signUpError;
      if (!authData?.user) throw new Error('Failed to create user account');

      // Update profile for invited user
      const { error: profileError } = await supabase
        .from('profiles')
        .update(
          {
            email: invitationData.email,
            first_name: firstName,
            last_name: lastName,
            role: invitationData.role || 'view_user'
          }
        )
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({ 
          accepted_at: new Date().toISOString(),
          role: invitationData.role || 'view_user'
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitationData.email,
        password: password
      });

      if (signInError) throw signInError;

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const totalSteps = 7;
  const stepLabels = [
    "Your\nAccount", 
    "Address\nDetails", 
    "WiFi\nSetup", 
    "Accept\nTerms",
    "Select\nPlan", 
    "Payment\nInfo",
    "All\nDone"
  ];

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep < step) {
      setStep(clickedStep);
    }
  };

  const handlePaymentSuccess = (id: string) => {
    setFormValue('paymentId', id);
  };

  const getSelectedPlanDetails = () => {
    return plans.find(plan => plan.id === formState.selectedPlan) || plans[1]; // Default to medium if not found
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission during loading or when already complete
    if (loading || registrationComplete) {
      return;
    }

    // Handle navigation between steps except for final step
    if (step < 6) {
      handleNext();
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Check if email already exists
      const { isRegistered } = await isEmailRegistered(formState.email);
      if (isRegistered) {
        setError('This email is already registered. Please use a different email or sign in.');
        setLoading(false);
        return;
      }
      
      // Validate all required fields
      if (!formState.email || !formState.password || !formState.firstName || !formState.lastName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (!formState.paymentId) {
        setError('Payment information is required');
        setLoading(false);
        return;
      }
      
      // Register user with Supabase
      const { user: newUser, error: registerError } = await registerUser(
        formState.email,
        formState.password,
        formState.firstName,
        formState.lastName
      );
      
      if (registerError || !newUser || !newUser.id) {
        throw new Error(registerError || 'Failed to create user account');
      }

      // Get auth session after registration
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get authentication token');
      }

      // Update profile synchronously
      // Update profile with additional details
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          address_line1: formState.address1,
          address_line2: formState.address2,
          city: formState.city,
          postcode: formState.postcode,
          subscription_plan: formState.selectedPlan,
          subscription_status: 'active',
          wifi_configured: formState.configureWifi === 'yes',
          wifi_ssid: formState.configureWifi === 'yes' ? formState.wifiSSID : null,
          wifi_password: formState.configureWifi === 'yes' ? formState.wifiPassword : null,
          subscription_id: formState.paymentId,
          subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', newUser.id);
      
      if (updateError) {
        console.error('Failed to update profile:', updateError);
        throw new Error('Failed to update profile');
      }
      
      
      // Send welcome email only after successful profile update
      const selectedPlan = getSelectedPlanDetails();
      const emailResult = await emailService.sendSignupCompletionEmail({
        email: formState.email,
        firstName: formState.firstName,
        lastName: formState.lastName,
        plan: selectedPlan.name,
        address_line1: formState.address1,
        address_line2: formState.address2,
        city: formState.city,
        postcode: formState.postcode,
        amount: selectedPlan.price,
        subscriptionDay: dayWithSuffix
      }, session.access_token);
      
      if (!emailResult.success) {
        throw new Error('Failed to send welcome email: ' + emailResult.error);
      }
      
      // Show confirmation step after everything is complete
      setRegistrationComplete(true);
      setStep(7);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <AccountStep 
            formState={formState}
            setFormValue={setFormValue}
            validationErrors={validationErrors}
            checkingEmail={checkingEmail}
          />
        );
      case 2:
        return (
          <AddressStep 
            formState={formState}
            setFormValue={setFormValue}
            validationErrors={validationErrors}
          />
        );
      case 3:
        return (
          <WifiStep 
            formState={formState}
            setFormValue={setFormValue}
            validationErrors={validationErrors}
          />
        );
      case 4:
        return (
          <TermsStep
            formState={formState}
            setFormValue={setFormValue}
            validationErrors={validationErrors}
          />
        );
      case 5:
        return (
          <PlanStep 
            formState={formState}
            setFormValue={setFormValue}
            validationErrors={validationErrors}
            plans={plans}
          />
        );
      case 6:
        return (
          <Elements stripe={stripePromise}>
            <PaymentStep 
              formState={formState}
              setFormValue={setFormValue}
              selectedPlan={getSelectedPlanDetails()}
              onSuccess={handlePaymentSuccess}
              onProcessingChange={setIsProcessingPayment}
              validationErrors={validationErrors}
            />
          </Elements>
        );
      case 7:
        return (
          <ConfirmationStep
            formState={formState}
            selectedPlan={getSelectedPlanDetails()}
          />
        );
      default:
        return null;
    }
  };

  // If this is an invitation registration, show simplified form
  if (inviteId) {
    return (
      <AuthForm
        title="Complete Your Registration"
        buttonText={loading ? 'Setting up your account...' : 'Complete Registration'}
        loadingText="Setting up your account..."
        error={error}
        loading={loading}
        onSubmit={(e) => {
          e.preventDefault();
          handleInvitedUserSubmit(formState.password || '');
        }}
        alternateText="Already have an account?"
        alternateLinkText="Sign in"
        alternateLinkPath="/login"
      >
        {invitationData && (
          <InvitedUserStep
            email={invitationData.email}
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            password={formState.password}
            setPassword={(password) => setFormValue('password', password)}
            error={error}
          />
        )}
      </AuthForm>
    );
  }

  // Regular registration flow continues here...
  return (
    <AuthForm
      title={
        step === 1 ? "Create your account" :
        step === 2 ? "Address Details" :
        step === 3 ? "WiFi Configuration" :
        step === 4 ? "Accept Terms" :
        step === 5 ? "Select Your Plan" :
        step === 6 ? "Payment Information" :
        "All Done!"
      }
      buttonText={
        step === 6 ? "Complete Registration" :
        step < 6 ? "Continue" :
        "Go to Dashboard"
      }
      loadingText={
        step === 6 ? "Completing registration..." :
        step < 6 ? "Continuing..." :
        "Redirecting..."
      }
      error={error}
      loading={loading || (step === 6 && isProcessingPayment)}
      onSubmit={step === 7 ? () => navigate('/admin/dashboard') : handleSubmit}
      alternateText="Already have an account?"
      alternateLinkText="Sign in"
      alternateLinkPath="/login"
      showSteps={true}
      currentStep={step}
      totalSteps={totalSteps}
      showBackButton={step > 1 && step < 7}
      onBack={handleBack}
      stepLabels={stepLabels}
      onStepClick={handleStepClick}
    >
      {renderStep()}
    </AuthForm>
  );
};

export default Register;
