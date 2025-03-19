import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertItemProps {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'resolved';
  timestamp: string;
  status: 'active' | 'resolved';
  onAcknowledge?: (id: number) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AlertItem: React.FC<AlertItemProps> = ({
  id,
  title,
  description,
  severity,
  timestamp,
  status,
  onAcknowledge
}) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow"
      style={{
        borderLeftColor:
          severity === 'critical'
            ? '#ef4444'
            : severity === 'warning'
            ? '#f59e0b'
            : '#10b981',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {severity === 'critical' ? (
            <AlertCircle className="text-red-500 mt-1" />
          ) : severity === 'warning' ? (
            <AlertCircle className="text-yellow-500 mt-1" />
          ) : (
            <CheckCircle className="text-green-500 mt-1" />
          )}
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                {new Date(timestamp).toLocaleString()}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                  severity
                )}`}
              >
                {severity}
              </span>
            </div>
          </div>
        </div>
        {status === 'active' && onAcknowledge && (
          <button 
            className="px-4 py-2 text-sm text-blue-500 hover:text-blue-700"
            onClick={() => onAcknowledge(id)}
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertItem;
