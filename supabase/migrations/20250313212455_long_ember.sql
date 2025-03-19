/*
  # Email Queue and Contact Form Schema

  1. New Tables
    - `email_queue`
      - For managing outgoing emails
      - Includes status tracking and error handling
      - Added text_body and html_body fields
    - `contact_form_submissions`
      - For tracking form submissions
      - Includes spam prevention fields

  2. Security
    - Enable RLS on both tables
    - Add service role policies
*/

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  from_email text NOT NULL DEFAULT 'noreply@residentialtemperature.com',
  subject text NOT NULL,
  text_body text,
  html_body text,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT email_queue_status_values 
    CHECK (status IN ('pending', 'sent', 'failed')),
  error text,
  attempts integer DEFAULT 0,
  smtp2go_response jsonb,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on email queue
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for email queue
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_queue' 
    AND policyname = 'Service role can manage email queue'
  ) THEN
    CREATE POLICY "Service role can manage email queue"
    ON email_queue FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Create contact form submissions tracking table
CREATE TABLE IF NOT EXISTS contact_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  captcha_token text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for contact form submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
ON contact_form_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
ON contact_form_submissions(email);

-- Enable RLS on submissions tracking
ALTER TABLE contact_form_submissions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for contact form submissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_form_submissions' 
    AND policyname = 'Service role can manage contact form submissions'
  ) THEN
    CREATE POLICY "Service role can manage contact form submissions"
    ON contact_form_submissions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
