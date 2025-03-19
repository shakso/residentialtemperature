import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { supabase } from './lib/supabase';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure AWS SES
const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Get email configuration from Supabase
async function getEmailConfig() {
  const { data, error } = await supabase
    .from('email_service_config')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

// Contact form endpoint
app.post('/api/email/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Get email configuration
    const config = await getEmailConfig();

    // Send email using AWS SES
    await ses.sendEmail({
      Source: config.default_from_email,
      Destination: {
        ToAddresses: [process.env.AWS_SES_FROM_EMAIL]
      },
      Message: {
        Subject: {
          Data: 'New Contact Form Submission'
        },
        Body: {
          Text: {
            Data: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`
          },
          Html: {
            Data: `
               <h2>New Contact Form Submission</h2>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
               <p><strong>Message:</strong></p>
               <p>${message}</p>
             `
          }
        }
      }
    }).promise();

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Invitation email endpoint
app.post('/api/email/invitation', async (req, res) => {
  try {
    const { email, invitationId } = req.body;
    
    // Validate required fields
    if (!email || !invitationId) {
      return res.status(400).json({ 
        error: 'Email and invitation ID are required' 
      });
    }

    // Verify invitation exists
    const { data: invitation, error: inviteError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('email', email)
      .single();

    if (inviteError || !invitation) {
      return res.status(404).json({
        error: 'Invalid invitation'
      });
    }

    // Get email configuration
    const config = await getEmailConfig();
    
    // Get origin from request headers or use default
    const origin = req.headers.origin || 'https://residentialtemperature.com';
    
    // Send invitation email using AWS SES
    await ses.sendEmail({
      Source: config.default_from_email,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'Invitation to Join Residential Temperature'
        },
        Body: {
          Text: {
            Data: `You have been invited to join Residential Temperature. Click the link below to set your password and complete your account setup:\n\n${origin}/register/set-password?invite=${invitationId}`
          },
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <img src="${config.logo_url}" alt="Residential Temperature" style="max-width: 200px; height: auto; margin: 20px 0;" />
                <h2 style="color: #2563eb; margin-bottom: 24px;">Welcome to Residential Temperature!</h2>
                <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                  You have been invited to join Residential Temperature. To complete your account setup, please set your password using the link below.
                </p>
                <div style="margin: 24px 0;">
                  <a href="${origin}/register/set-password?invite=${invitationId}"
                     style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Set Your Password
                  </a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                  If you did not request this invitation, please ignore this email.
                </p>
              </div>
            `
          }
        }
      }
    }).promise();

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    res.status(500).json({ error: 'Failed to send invitation email' });
  }
});

const port = process.env.EMAIL_API_PORT || 3002;
app.listen(port, () => {
  console.log(`Email API server running on port ${port}`);
});
