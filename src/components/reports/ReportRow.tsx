import React from 'react';
import { Download } from 'lucide-react';

interface ReportRowProps {
  id: number;
  name: string;
  date: string;
  type: string;
  status: 'Generated' | 'Processing';
  onDownload?: (id: number) => void;
}

const ReportRow: React.FC<ReportRowProps> = ({
  id,
  name,
  date,
  type,
  status,
  onDownload
}) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{date}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{type}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            status === 'Generated'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {status === 'Generated' && onDownload && (
          <button 
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => onDownload(id)}
          >
            <Download size={16} className="mr-1" />
            Download
          </button>
        )}
      </td>
    </tr>
  );
};

export default ReportRow;
