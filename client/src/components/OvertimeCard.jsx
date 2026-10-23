import React from 'react';
import { FiClock, FiUser, FiAlignLeft } from 'react-icons/fi';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const statusBadge = (status) => {
  const map = {
    approved: 'badge-green',
    rejected: 'badge-red',
    pending: 'badge-yellow',
  };
  return (
    <span className={map[status] || 'badge-gray'}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
};

const OvertimeCard = ({ request }) => {
  const { date, hoursRequested, reason, status, reviewNote, createdAt, employee } = request || {};

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-lg font-semibold text-gray-900">{formatDate(date)}</p>
          {employee && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <FiUser size={12} />
              <span>{employee.name || employee.email}</span>
            </div>
          )}
        </div>
        {statusBadge(status)}
      </div>

      <div className="flex items-center gap-2 text-sm mb-3">
        <FiClock className="text-blue-500" />
        <span className="text-gray-600">Hours Requested:</span>
        <span className="font-semibold text-blue-600">{hoursRequested}h</span>
      </div>

      {reason && (
        <div className="flex items-start gap-2 text-sm mb-3">
          <FiAlignLeft className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Reason</p>
            <p className="text-gray-700">{reason}</p>
          </div>
        </div>
      )}

      {reviewNote && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Review Note</p>
          <p className="text-sm text-gray-700 italic">"{reviewNote}"</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
        Submitted: {formatDateTime(createdAt)}
      </div>
    </div>
  );
};

export default OvertimeCard;
