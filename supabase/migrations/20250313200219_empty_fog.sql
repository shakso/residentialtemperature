/*
  # Email and Contact Form Schema Updates

  1. New Tables
    - `email_queue`
      - For managing outgoing emails
      - Includes status tracking and error handling
    - `contact_form_submissions`
      - For tracking form submissions and preventing spam
  
  2. Updates
    - Add status field to contact_messages table
    - Add status constraints and checks
  
  3. Security
    - Enable RLS on new tables
    - Add service role policies
*/

-- Add status field to contact_messages if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_messages' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE contact_messages 
    ADD COLUMN status text NOT NULL DEFAULT 'new';

    ALTER TABLE contact_messages
    ADD CONSTRAINT contact_messages_status_check
    CHECK (status IN ('new', 'read', 'replied', 'archived'));
  END IF;
END $$;

-- Create email queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT email_queue_status_values 
    CHECK (status IN ('pending', 'sent', 'failed')),
  error text,
  attempts integer DEFAULT 0,
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
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on submissions tracking
ALTER TABLE contact_form_submissions ENABLE ROW LEVEL SECURITY;
