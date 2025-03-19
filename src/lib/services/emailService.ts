import { ContactFormData } from '../types/forms';
import { supabase } from '../supabase';

interface SignupCompletionData {
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  amount: number;
  subscriptionDay: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
}

export const emailService = {
  async sendContactForm(data: ContactFormData): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/email/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? 'Email service is temporarily unavailable. Please try again later.'
            : responseData.error || 'Failed to send message'
        );
      }

      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to process your message. Please try again.');
      }

      return { success: true };
    } catch (error: any) {
      if (error instanceof TypeError && error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async sendSignupCompletionEmail(data: SignupCompletionData, accessToken: string): Promise<EmailResponse> {
    try {
      const { data: config, error: configError } = await supabase
        .from('email_service_config').select('*').maybeSingle();

      if (configError || !config) {
        console.error('Failed to load email configuration:', configError);
        return { success: false, error: 'Email service configuration not available' };
      }

      const response = await fetch('/api/email/signup-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          to_email: data.email,
          subject: 'Welcome to Residential Temperature - Getting Started',
          from_email: config.default_from_email,
          reply_to: config.default_reply_to,
          text_body: `Welcome to Residential Temperature, ${data.firstName}!\n\nThank you for choosing the ${data.plan} plan. Your account has been successfully created.\n\nTo get started:\n1. Access your dashboard at ${window.location.origin}/admin/dashboard\n2. Watch our setup guides\n3. Configure your devices\n\nDelivery Information:\n${config.delivery_info}\n${config.tracking_info}\n\nDelivery Address:\n${data.firstName} ${data.lastName}\n${data.address_line1}\n${data.address_line2 ? data.address_line2 + '\n' : ''}${data.city}\n${data.postcode}\n\nSubscription Information:\nYour first payment of £${data.amount} has been processed successfully.\n${config.subscription_info.replace('{day}', data.subscriptionDay)}\n\nIf you need any assistance, our support team is here to help at support@residentialtemperature.com\n\nBest regards,\nThe Residential Temperature Team`,
          html_body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${config.logo_url}" alt="Residential Temperature" style="max-width: 200px; height: auto;" />
              </div>

              <h1 style="color: #2563eb; margin-bottom: 24px;">Welcome to Residential Temperature!</h1>
              
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                Dear ${data.firstName},
              </p>
              
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                Thank you for choosing our ${data.plan} plan. Your account has been successfully created and is ready to use.
              </p>

              <div style="margin: 24px 0;">
                <a href="${window.location.origin}/admin/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 16px;">
                  Access Dashboard
                </a>
              </div>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="font-size: 16px; line-height: 1.5; color: #374151; margin: 0;">
                  <strong>Delivery Information:</strong><br>
                  ${config.delivery_info}<br>
                  ${config.tracking_info}
                </p>
                <p style="font-size: 16px; line-height: 1.5; color: #374151; margin: 12px 0 0 0;">
                  <strong>Delivery Address:</strong><br>
                  ${data.firstName} ${data.lastName}<br>
                  ${data.address_line1 || ''}<br>
                  ${data.address_line2 ? `${data.address_line2}<br>` : ''}
                  ${data.city || ''}<br>
                  ${data.postcode || ''}
                </p>
              </div>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="font-size: 16px; line-height: 1.5; color: #374151; margin: 0;">
                  <strong>Subscription Information:</strong><br>
                  Your first payment of £${data.amount || 0} has been processed successfully.<br>
                  ${config.subscription_info.replace('{day}', data.subscriptionDay || '')}
                </p>
              </div>
              
              <h3 style="color: #1f2937; margin-top: 32px;">Setup Guides</h3>
              
              <ul style="list-style: none; padding: 0; margin: 24px 0;">
                <li style="margin-bottom: 16px;">
                  <a href="#" style="color: #2563eb; text-decoration: none;">
                    📺 Gateway Setup Guide
                  </a>
                </li>
                <li style="margin-bottom: 16px;">
                  <a href="#" style="color: #2563eb; text-decoration: none;">
                    📺 Sensor Placement Guide
                  </a>
                </li>
                <li style="margin-bottom: 16px;">
                  <a href="#" style="color: #2563eb; text-decoration: none;">
                    📺 Using the Dashboard
                  </a>
                </li>
              </ul>
              
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                If you need any assistance, our support team is here to help at support@residentialtemperature.com
              </p>
              
              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280;">
                  Best regards,<br>
                  The Residential Temperature Team
                </p>
              </div>
            </div>
          `
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          return { success: false, error: 'Network error while sending email' };
        }
        return {
          success: false,
          error: errorData?.error?.message || 'Failed to send welcome email'
        };
      }

      const result = await response.json();
      return { success: true };
    } catch (error: any) {
      console.error('Error sending signup completion email:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred while sending email'
      };
    }
  }
}
