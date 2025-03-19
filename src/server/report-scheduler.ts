import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { supabase } from './lib/supabase';
import AWS from 'aws-sdk';
import fs from 'fs';
import os from 'os';
import { generatePDF } from '../components/reports/PDFReport';


// Load environment variables
dotenv.config();

// Verify required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SES_FROM_EMAIL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Create temp directory for PDF generation
const TEMP_DIR = path.join(os.tmpdir(), 'residential-temperature-reports');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configure AWS SES
const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Clean up old temp files
function cleanupTempFiles() {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Remove files older than 1 hour
      if (now - stats.mtimeMs > 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error('Error cleaning up temp files:', err);
  }
}

// Run cleanup every 15 minutes
setInterval(cleanupTempFiles, 15 * 60 * 1000);

// Process scheduled reports every minute
setInterval(async () => {
  const timestamp = new Date().toISOString();
  console.log('\n=== Report Scheduler Check ===');
  console.log(`Timestamp: ${timestamp}`);
  console.log('Querying scheduled_reports table...');

  try {
    // Get reports that need to be run
    const { data: reports, error } = await supabase
      .from('scheduled_reports') 
      .select(` 
        id,
        user_id,
        report_type,
        day_of_week,
        time_of_day,
        date_range_days,
        parameters,
        last_run_at
      `)
      .eq('active', true) 
      .or('next_run_at.lte.now(),last_run_at.is.null');

    if (error) throw error;
    
    console.log(`Found ${reports?.length || 0} reports to process`);
    
    if (!reports?.length) {
      console.log('No reports need processing at this time');
      console.log('=== Check Complete ===\n');
      return;
    }

    // Process each report
    for (const report of reports) {
      console.log(`\nProcessing report ${report.id}:`);
      console.log(`- User ID: ${report.user_id}`);
      console.log(`- Type: ${report.report_type}`);
      console.log(`- Schedule: Day ${report.day_of_week} at ${report.time_of_day}`);
      console.log(`- Last run: ${report.last_run_at || 'Never'}`);

      try {
        // Get user email
        const { data: user } = await supabase.auth.admin.getUserById(report.user_id);
        if (!user?.user?.email) {
          console.log('❌ No email found for user, skipping report');
          continue;
        }
        console.log(`- Email: ${user.user.email}`);

        try {
          // Generate report data
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - report.date_range_days);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          console.log(`- Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

          // Get temperature stats
          console.log('Fetching temperature stats...');
          const { data: overallStats, error: statsError } = await supabase
            .rpc('get_temperature_stats', {
              p_user_id: report.user_id,
              p_start_date: startDate.toISOString(),
              p_end_date: endDate.toISOString()
            });

          if (statsError) throw statsError;

          // Get sensor stats
          console.log('Fetching sensor stats...');
          const { data: sensorStats, error: sensorError } = await supabase
            .rpc('get_sensor_temperature_stats', {
              p_user_id: report.user_id,
              p_start_date: startDate.toISOString(),
              p_end_date: endDate.toISOString()
            });

          if (sensorError) throw sensorError;

          let pdfBuffer: Buffer | null = null;
          let emailSent = false;

          // Generate PDF
          try {
            console.log('Generating PDF report...');
            const doc = await generatePDF({
              overallStats: overallStats[0],
              sensorStats,
              startDate,
              endDate
            });
            console.log('Converting PDF to buffer...');
            pdfBuffer = Buffer.from(await doc.output('arraybuffer'));

            console.log('Sending email with PDF attachment...');
            // Send email with PDF attachment
            await ses.sendRawEmail({
              RawMessage: {
                Data: `From: ${process.env.AWS_SES_FROM_EMAIL}
To: ${user.user.email}
Subject: Your Scheduled Temperature Report
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="NextPart"

--NextPart
Content-Type: text/html; charset=utf-8

<div style="font-family: Arial, sans-serif;">
  <h2>Your Scheduled Temperature Report</h2>
  <p>Please find your temperature report attached.</p>
  <p>Report period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>
</div>

--NextPart
Content-Type: application/pdf
Content-Disposition: attachment; filename="temperature-report-${startDate.toISOString().split('T')[0]}.pdf"
Content-Transfer-Encoding: base64

${pdfBuffer?.toString('base64')}
--NextPart--`
              }
            }).promise();
            emailSent = true;
            console.log('✅ Email sent successfully');
          } catch (err) {
            console.error('❌ Error generating/sending report:', err);
          }

          // Update last run time and calculate next run
          console.log('Updating report schedule...');
          await supabase
            .from('scheduled_reports')
            .update([{
              id: report.id,
              last_run_at: new Date().toISOString(),
              next_run_at: null // Will be updated by trigger
            }])
            .eq('id', report.id);
          console.log(`✅ Report ${report.id} processed successfully`);
        } catch (err) {
          console.error('❌ Error processing report:', err);
          continue;
        }

      } catch (err) {
        console.error(`❌ Failed to process report ${report.id}:`, err);
        continue;
      }
    }
    console.log('\n=== Check Complete ===\n');
  } catch (err) {
    console.error('❌ Error checking scheduled reports:', err);
    console.log('=== Check Failed ===\n');
  }
}, 60000); // Check every minute

// Start server
const port = process.env.REPORT_SCHEDULER_PORT || 3003;
app.listen(port, () => {
  console.log(`Report scheduler service running on port ${port}`);
  console.log('Report scheduler initialized');
  console.log('Checking for scheduled reports every minute');
  console.log('Watching scheduled_reports table for tasks...\n');
});
