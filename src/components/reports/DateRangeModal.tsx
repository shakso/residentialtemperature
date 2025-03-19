import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRange {
  startDate: Date;
  endDate: Date;
  schedule?: {
    enabled: boolean;
    dayOfWeek: number;
    time: string;
    dateRangeDays?: number;
  };
}

interface DateRangeModalProps {
  onClose: () => void;
  onSubmit: (range: DateRange) => void;
  mode: 'generate' | 'schedule';
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({ onClose, onSubmit, mode }) => {
  const [selectedOption, setSelectedOption] = useState<'last-day' | 'last-7-days' | 'last-14-days' | 'custom'>(
    mode === 'schedule' ? 'last-day' : 'last-7-days'
  );
  const today = new Date();
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(1); // Monday
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [dateRangeDays, setDateRangeDays] = useState(7);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const getLastDayRange = (): DateRange => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    return { startDate: start, endDate: end };
  };

  const getLast7DaysRange = (): DateRange => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    return { startDate: start, endDate: end };
  };

  const getLast14DaysRange = (): DateRange => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 14);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    return { startDate: start, endDate: end };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let range: DateRange;

    switch (selectedOption) {
      case 'last-day':
        range = getLastDayRange();
        break;
      case 'last-7-days':
        range = getLast7DaysRange();
        break;
      case 'last-14-days':
        range = getLast14DaysRange();
        break;
      default:
        // For custom range, ensure we create proper Date objects
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        range = { startDate: start, endDate: end };
    }

    // If scheduling is enabled, save the schedule
    if (mode === 'schedule') {
      const days = (() => {
        switch (selectedOption) {
          case 'last-day':
            return 1;
          case 'last-7-days':
            return 7;
          case 'last-14-days':
            return 14;
          default:
            return 7;
        }
      })();
      
      const scheduleRange = {
        ...range,
        schedule: {
          enabled: true,
          dayOfWeek: scheduleDayOfWeek,
          time: scheduleTime,
          dateRangeDays: days
        }
      };
      
      onSubmit(scheduleRange);
    } else {
      onSubmit(range);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] !m-0 p-0">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Calendar className="mr-2" /> {mode === 'generate' ? 'Select Date Range' : 'Schedule Report'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {mode === 'schedule' ? (
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="last-day"
                  checked={selectedOption === 'last-day'}
                  onChange={(e) => setSelectedOption(e.target.value as any)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span>Last 24 Hours</span>
              </label>
            ) : null}

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="last-7-days"
                checked={selectedOption === 'last-7-days'}
                onChange={(e) => setSelectedOption(e.target.value as any)}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span>Last 7 Days</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="last-14-days"
                checked={selectedOption === 'last-14-days'}
                onChange={(e) => setSelectedOption(e.target.value as any)}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span>Last 14 Days</span>
            </label>

            {mode === 'generate' ? (
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="custom"
                  checked={selectedOption === 'custom'}
                  onChange={(e) => setSelectedOption(e.target.value as any)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span>Custom Range</span>
              </label>
            ) : null}
          </div>

          {selectedOption === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'schedule' && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={scheduleDayOfWeek}
                    onChange={(e) => setScheduleDayOfWeek(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${mode === 'generate' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md`}
            >
              {mode === 'generate' ? 'Generate Report' : 'Schedule Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateRangeModal;
