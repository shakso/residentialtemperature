import React, { useState, useEffect } from 'react';
import { Filter, FileText } from 'lucide-react';
import ReportRow from '../components/reports/ReportRow';
import TemperatureReportModal from '../components/reports/TemperatureReportModal';
import TemperatureReport from '../components/reports/TemperatureReport';
import { getTemperatureStats } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportWindow, setReportWindow] = useState<Window | null>(null);

  useEffect(() => {
    document.title = 'Reports | residential temperature';
  }, []);

  const handleGenerateReport = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      // Get report data
      const data = await getTemperatureStats(startDate, endDate);

      // Open new window
      const reportWin = window.open('', '_blank');
      if (!reportWin) {
        throw new Error('Failed to open report window. Please allow pop-ups and try again.');
      }

      // Set initial content
      reportWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Temperature Report</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="report">Loading report...</div>
          </body>
        </html>
      `);

      // Store window reference
      setReportWindow(reportWin);
      setReportData({
        startDate,
        endDate,
        ...data
      });

      // Close modal
      setShowModal(false);
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
      if (reportWindow) {
        reportWindow.close();
      }
    } finally {
      setLoading(false);
    }
  };

  // Render report in new window when data is ready
  useEffect(() => {
    if (reportWindow && reportData) {
      // Create a new root and render the report
      const container = reportWindow.document.getElementById('report');
      if (container) {
        // Render the report content
        container.innerHTML = '';
        const root = reportWindow.document.createElement('div');
        container.appendChild(root);
        
        // Use React.createElement to create the report component
        const report = React.createElement(TemperatureReport, {
          startDate: reportData.startDate,
          endDate: reportData.endDate,
          overallStats: reportData.overallStats,
          sensorStats: reportData.sensorStats
        });

        // Render using ReactDOM
        const ReactDOM = require('react-dom/client');
        ReactDOM.createRoot(root).render(report);
      }
    }
  }, [reportWindow, reportData]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate and view temperature reports
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {showModal && (
        <TemperatureReportModal
          onClose={() => setShowModal(false)}
          onGenerate={handleGenerateReport}
        />
      )}
    </div>
  );
};

export default Reports;
