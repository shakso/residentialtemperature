import ReactApexChart from 'react-apexcharts';
import { format } from 'date-fns';
import React from 'react';
import { Sensor } from '../components/sensors/types';
import { useState, useEffect } from 'react';
import { LineChart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSensors, getSensorReadings } from '../lib/api';

type TimeRange = '6h' | '1d' | '5d' | '10d';

interface TimeRangeOption {
  label: string;
  value: TimeRange;
  hours: number;
}

const TIME_RANGES: TimeRangeOption[] = [
  { label: '6h', value: '6h', hours: 6 },
  { label: '1d', value: '1d', hours: 24 },
  { label: '5d', value: '5d', hours: 24 * 5 },
  { label: '10d', value: '10d', hours: 24 * 10 }
];

interface SensorReading {
  id: string;
  temperature: number;
  humidity: number;
  rssi: number;
  timestamp: string;
}

const GRAPHS_PER_PAGE = 4;

const Graphs = () => {
  const { user } = useAuth();
  const [sensorCount, setSensorCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sensors, setSensors] = useState<Sensor[]>([]);

  useEffect(() => {
    document.title = 'Graphs | residential temperature';
  }, []);

  useEffect(() => {
    const fetchSensorCount = async () => {
      if (!user) return;

      try {
        const data = await getUserSensors(user.id);
        setSensorCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error('Error fetching sensor count:', err);
      }
    };

    fetchSensorCount();
  }, [user]);

  const [sensorReadings, setSensorReadings] = useState<{ 
    [key: string]: { 
      readings: SensorReading[],
      timeRange: TimeRange 
    } 
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sensors and their readings
  useEffect(() => {
    const fetchSensors = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getUserSensors(user.id);
        setSensors(data);
        
        const readings = {};
        for (const sensor of data) {
          const sensorReadings = await getSensorReadings(sensor.id, 6); // Default to 6 hours
          readings[sensor.id] = {
            readings: sensorReadings.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
            timeRange: '6h'
          };
        }
        setSensorReadings(readings);
      } catch (err: any) {
        console.error('Error fetching sensors:', err);
        setError('Failed to load sensors');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, [user]);

  const handleTimeRangeChange = async (sensorId: string, newRange: TimeRange) => {
    const selectedHours = TIME_RANGES.find(r => r.value === newRange)?.hours || 6;
    try {
      const newReadings = await getSensorReadings(sensorId, selectedHours);
      setSensorReadings(prev => ({
        ...prev,
        [sensorId]: {
          readings: newReadings.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ),
          timeRange: newRange
        }
      }));
    } catch (err) {
      console.error('Error fetching readings:', err);
    }
  };

  // Filter sensors based on search term
  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSensors.length / GRAPHS_PER_PAGE);
  const startIndex = (currentPage - 1) * GRAPHS_PER_PAGE;
  const paginatedSensors = filteredSensors.slice(startIndex, startIndex + GRAPHS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500">Your graphs will appear here once we have dispatched your order.</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-3">
          <LineChart className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Graphs</h1>
            <p className="text-sm text-gray-500 mt-1">
              View temperature trends over time
            </p>
          </div>
        </div>
        <div className="hidden md:flex text-sm text-gray-500 items-center">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {sensorCount} sensor{sensorCount !== 1 ? 's' : ''} connected
          </span>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 -mx-4 sm:mx-0">
        {paginatedSensors.map((sensor) => {
          const sensorData = sensorReadings[sensor.id] || { readings: [], timeRange: '6h' };
          const readings = sensorData.readings;
          const isWeeklyView = sensorData.timeRange === '5d' || sensorData.timeRange === '10d';
          const formatStr = isWeeklyView ? 'EEE HH:mm' : 'HH:mm';
          const data = {
            temperature: readings.map(r => r.temperature),
            timestamps: readings.map(r => format(new Date(r.timestamp), formatStr))
          };
          
          const options = {
            chart: {
              id: `sensor-${sensor.id}`,
              type: 'line' as const,
              width: '98%',
              toolbar: {
                show: true,
                tools: {
                  download: true,
                  selection: true,
                  zoom: true,
                  zoomin: true,
                  zoomout: true,
                  pan: true,
                  reset: true
                },
                autoSelected: 'zoom',
                position: 'left',
                offsetX: -10,
                offsetY: 20
              },
              animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                  enabled: true,
                  delay: 150
                },
                dynamicAnimation: {
                  enabled: true,
                  speed: 350
                }
              }
            },
            colors: ['#f97316'], // Orange for temperature
            stroke: {
              curve: 'smooth' as const,
              width: 2
            },
            grid: {
              borderColor: '#e0e0e0',
              row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
              }
            },
            xaxis: {
              categories: data.timestamps,
              title: {
                text: 'Time'
              },
              tickAmount: 6,
              labels: {
                rotate: -45,
                show: true,
                trim: isWeeklyView,
                hideOverlappingLabels: false,
                formatter: function(value: string, timestamp?: number, opts?: any) {
                  if (opts?.dataPointIndex === undefined) return value;
                  // Show more labels for weekly view
                  const interval = isWeeklyView ? 6 : 4;
                  return opts.dataPointIndex % interval === 0 ? value : '';
                }
              }
            },
            yaxis: {
              title: {
                text: 'Temperature (°C)'
              }
            },
            tooltip: {
              y: {
                formatter: (value: number) => `${value}°C`
              }
            },
            legend: {
              show: false
            }
          };

          const series = [
            {
              name: 'Temperature',
              type: 'line',
              data: data.temperature
            }
          ];

          return (
            <div key={sensor.id} className="bg-white p-3 sm:p-6 rounded-lg shadow-md w-full overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">{sensor.name}</h2>
              <div className="h-[300px] w-full">
                {data.temperature.length > 0 ? (
                <ReactApexChart
                  options={options}
                  series={series}
                  type="line"
                  height="100%"
                  width="100%"
                />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleTimeRangeChange(sensor.id, range.value)}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        sensorData.timeRange === range.value
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-md ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Graphs;
