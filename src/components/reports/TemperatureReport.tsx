import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
export interface TemperatureStats {
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  min_temp_sensor_name: string;
  max_temp_sensor_name: string;
  min_temp_time: string;
  max_temp_time: string;
}

export interface SensorTemperatureStats {
  sensor_id: string;
  sensor_name: string;
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  min_temp_time: string;
  max_temp_time: string;
}

interface TemperatureReportProps {
  overallStats: TemperatureStats;
  sensorStats: SensorTemperatureStats[];
  startDate: Date;
  endDate: Date;
}

const formatDateTime = (dateStr: string) => {
  return format(new Date(dateStr), 'EEEE do MMMM yyyy h:mm a');
};

export const generatePDF = ({
  overallStats,
  sensorStats,
  startDate,
  endDate
}: TemperatureReportProps) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Temperature Report', 20, 20);
  
  // Date Range
  doc.setFontSize(12);
  doc.text(`Report Period: ${format(startDate, 'EEEE do MMMM yyyy')} to ${format(endDate, 'EEEE do MMMM yyyy')}`, 20, 30);
  
  // Overall Stats
  doc.setFontSize(16);
  doc.text('Overall Temperature Statistics', 20, 45);
  
  if (overallStats.avg_temp) {
    const overallData = [
      ['Metric', 'Value', 'Sensor', 'Time'],
      [
        'Minimum Temperature',
        `${overallStats.min_temp}°C`,
        overallStats.min_temp_sensor_name,
        formatDateTime(overallStats.min_temp_time)
      ],
      [
        'Maximum Temperature',
        `${overallStats.max_temp}°C`,
        overallStats.max_temp_sensor_name,
        formatDateTime(overallStats.max_temp_time)
      ],
      [
        'Average Temperature',
        `${overallStats.avg_temp}°C`,
        '',
        ''
      ]
    ];
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Metric', 'Value', 'Sensor', 'Time']],
      body: overallData.slice(1),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  } else {
    doc.setFontSize(12);
    doc.text('No temperature data available for the selected period', 20, 55);
  }
  
  // Sensor Stats
  doc.setFontSize(16);
  doc.text('Sensor Statistics', 20, doc.lastAutoTable?.finalY + 20 || 90);
  
  const sensorData = sensorStats.map(stat => [
    stat.sensor_name,
    stat.min_temp ? `${stat.min_temp}°C` : 'N/A',
    stat.min_temp_time ? formatDateTime(stat.min_temp_time) : 'N/A',
    stat.max_temp ? `${stat.max_temp}°C` : 'N/A',
    stat.max_temp_time ? formatDateTime(stat.max_temp_time) : 'N/A',
    stat.avg_temp ? `${stat.avg_temp}°C` : 'N/A'
  ]);
  
  (doc as any).autoTable({
    startY: doc.lastAutoTable?.finalY + 25 || 95,
    head: [['Sensor', 'Min Temp', 'Min Time', 'Max Temp', 'Max Time', 'Avg Temp']],
    body: sensorData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  // Save the PDF
  return doc;
};

const TemperatureReport = (props: TemperatureReportProps) => {
  const doc = generatePDF(props);
  doc.save(`temperature-report-${format(props.startDate, 'yyyy-MM-dd')}.pdf`);
  
  // Return null since we're not rendering anything
  return null;
};

export default TemperatureReport;
