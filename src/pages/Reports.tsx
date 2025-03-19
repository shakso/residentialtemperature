import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import DateRangeModal from '../components/reports/DateRangeModal';
import { generatePDF } from '../components/reports/PDFReport';
import { getTemperatureStats, getSensorTemperatureStats, getSensorReadingsForReport } from '../lib/api/reports';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Toast from '../components/ui/Toast';

const daysOfWeek = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const Reports = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'generate' | 'schedule'>('generate');
  const [selectedOption, setSelectedOption] = useState<'last-day' | 'last-7-days' | 'last-14-days' | 'custom'>('last-7-days');

  useEffect(() => {
    document.title = 'Reports | residential temperature';
  }, []);

  const generateReportPDF = async (
    startDate: Date,
    endDate: Date,
    overallStats: TemperatureStats,
    sensorStats: any[]
  ): Promise<void> => {
    try {
      const doc = await generatePDF({
        overallStats,
        sensorStats,
        startDate,
        endDate
      });
      doc.save(`temperature-report-${format(startDate, 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      throw new Error('Failed to generate PDF report');
    }
  };

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  useEffect(() => {
    if (user) {
      fetchScheduledReports();
    }
  }, [user]);

  const fetchScheduledReports = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScheduledReports(data || []);
    } catch (err) {
      console.error('Error fetching scheduled reports:', err);
    }
  };

  const handleGenerateReport = async (range: { 
    startDate: Date; 
    endDate: Date; 
    schedule?: { 
      enabled: boolean; 
      dayOfWeek: number; 
      time: string; 
    } 
  }) => {
    try {
      setLoading(true);
      setError(null);

      if (modalType === 'schedule') {
        const { error: scheduleError } = await supabase
          .from('scheduled_reports')
          .insert({
            user_id: user?.id,
            report_type: 'temperature',
            day_of_week: range.schedule.dayOfWeek,
            time_of_day: range.schedule.time,
            date_range_days: range.schedule.dateRangeDays || 7,
            parameters: {
              startDate: range.startDate.toISOString(),
              endDate: range.endDate.toISOString()
            }
          });

        if (scheduleError) throw scheduleError;

        // Calculate next run time
        const nextRun = new Date();
        const daysUntilNext = (range.schedule.dayOfWeek - nextRun.getDay() + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysUntilNext);
        const [hours, minutes] = range.schedule.time.split(':');
        nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        setSuccess(`Report scheduled for ${format(nextRun, 'EEEE do MMMM yyyy')} at ${range.schedule.time}`);
        setTimeout(() => setSuccess(null), 5000);

        await fetchScheduledReports();
        setShowModal(false);
        return;
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get stats sequentially to ensure data consistency
      let overallStats;
      let sensorStats;
      
      try {
        // First get overall stats
        overallStats = await getTemperatureStats(user.id, range.startDate, range.endDate);
        if (!overallStats) {
          throw new Error('Failed to retrieve overall temperature statistics');
        }
        
        // Then get sensor stats
        sensorStats = await getSensorTemperatureStats(user.id, range.startDate, range.endDate);
        if (!sensorStats) {
          throw new Error('Failed to retrieve sensor temperature statistics');
        }
        
      } catch (statsError: any) {
        console.error('Error retrieving temperature statistics:', statsError);
        throw new Error('Failed to retrieve temperature data. Please try again.');
      }

      // Generate and download PDF
      await generateReportPDF(range.startDate, range.endDate, overallStats, sensorStats);

      // Close modal
      setShowModal(false);
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate reports to analyze your building's temperature data
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Temperature Overview</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  Analyse trends for all of the sensors in your building, including max/min and averages
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => {
                    setModalType('generate');
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => {
                    setModalType('schedule');
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 ml-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600"
                >
                  Schedule Report
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Export Data</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  Outputs all of your sensor data within a timeframe into Excel
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => {
                    setModalType('generate');
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => {
                    setModalType('schedule');
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 ml-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600"
                >
                  Schedule Report
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {showModal && (
        <DateRangeModal
          onClose={() => setShowModal(false)}
          mode={modalType}
          onSubmit={handleGenerateReport}
        />
      )}
      
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}
      
      {scheduledReports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Reports</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledReports.map(report => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.report_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {daysOfWeek[report.day_of_week]} at {report.time_of_day}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        Last {report.date_range_days === 1 ? '24 hours' : `${report.date_range_days} days`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          supabase
                            .from('scheduled_reports')
                            .delete()
                            .eq('id', report.id)
                            .then(() => fetchScheduledReports());
                        }}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
