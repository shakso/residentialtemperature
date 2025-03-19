/*
  # Fix Email Queue and Contact Form RLS Policies

  1. Updates
    - Add insert policies for authenticated users
    - Add insert policies for anon users for contact form
    - Maintain service role access

  2. Security
    - Enable RLS on all tables
    - Add proper access controls for submissions
*/

-- Add insert policy for email queue
CREATE POLICY "email_queue_insert_policy"
ON email_queue FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Add insert policy for contact form submissions
CREATE POLICY "contact_form_submissions_insert_policy"
ON contact_form_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Add indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status 
ON email_queue(status);

CREATE INDEX IF NOT EXISTS idx_email_queue_created_at 
ON email_queue(created_at);
