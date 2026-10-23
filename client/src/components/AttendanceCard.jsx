import React from 'react';
import { FiClock, FiMapPin, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatDate, formatTime, calcHours } from '../utils/dateUtils';

const statusBadge = (status) => {
  const map = {
    completed: 'badge-green',
    incomplete: 'badge-yellow',
    absent: 'badge-red',
  };
  return (
    <span className={map[status] || 'badge-gray'}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

const validationBadge = (status) => {
  const map = {
    valid: 'badge-green',
    invalid: 'badge-red',
    pending: 'badge-yellow',
  };
  return (
    <span className={map[status] || 'badge-gray'}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
};

const AttendanceCard = ({ record }) => {
  const { date, punchIn, punchOut, status, validationStatus, location } = record || {};

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-lg font-semibold text-gray-900">{formatDate(date)}</p>
          <p className="text-sm text-gray-500">Attendance Record</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {statusBadge(status)}
          {validationBadge(validationStatus || 'pending')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <FiClock className="text-green-500 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs">Punch In</p>
            <p className="font-medium">{formatTime(punchIn)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FiClock className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs">Punch Out</p>
            <p className="font-medium">{formatTime(punchOut)}</p>
          </div>
        </div>
      </div>

      {punchIn && punchOut && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">Total Hours</span>
          <span className="font-semibold text-blue-600">{calcHours(punchIn, punchOut)}</span>
        </div>
      )}

      {location?.address && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <FiMapPin size={12} />
          <span className="truncate">{location.address}</span>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
