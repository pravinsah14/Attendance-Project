import React from 'react';
import { useGetTeamAttendanceQuery } from '../../features/attendance/attendanceApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiUsers, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { formatTime, calcHours, formatDate } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ManagerDashboard = () => {
  const { data, isLoading, isError } = useGetTeamAttendanceQuery({
    date: dayjs().format('YYYY-MM-DD'),
  });

  const records = data?.attendances || [];
  const totalTeam = records.length;
  const presentToday = records.filter((r) => r.punchIn).length;
  const pendingValidations = records.filter((r) => r.validationStatus === 'pending' && r.punchIn).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading team data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Team overview for {dayjs().format('dddd, MMMM D, YYYY')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FiUsers} label="Total Team" value={totalTeam} color="bg-blue-500" />
        <StatCard icon={FiCheckCircle} label="Present Today" value={presentToday} color="bg-green-500" />
        <StatCard icon={FiAlertCircle} label="Pending Validations" value={pendingValidations} color="bg-yellow-500" />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Attendance — Today</h3>
        {isError && (
          <p className="text-red-500 text-sm">Failed to load team attendance.</p>
        )}
        {records.length === 0 ? (
          <p className="text-gray-500 text-sm">No team attendance records found for today.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    <td className="font-medium">{rec.employee?.name || '—'}</td>
                    <td className="text-gray-500">{rec.employee?.department || '—'}</td>
                    <td>{formatTime(rec.punchIn)}</td>
                    <td>{formatTime(rec.punchOut)}</td>
                    <td>
                      {rec.punchIn && rec.punchOut ? calcHours(rec.punchIn, rec.punchOut) : '—'}
                    </td>
                    <td>
                      <span
                        className={
                          rec.status === 'completed'
                            ? 'badge-green'
                            : rec.status === 'incomplete'
                            ? 'badge-yellow'
                            : 'badge-red'
                        }
                      >
                        {rec.status || 'Absent'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          rec.validationStatus === 'valid'
                            ? 'badge-green'
                            : rec.validationStatus === 'invalid'
                            ? 'badge-red'
                            : 'badge-yellow'
                        }
                      >
                        {rec.validationStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
