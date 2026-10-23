import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  useGetTodayStatusQuery,
  useGetMyAttendanceQuery,
} from '../../features/attendance/attendanceApi';
import { useGetMyOvertimeQuery } from '../../features/overtime/overtimeApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiClock, FiCalendar, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { formatDate, formatTime, calcHours } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const StatusBadge = ({ status }) => {
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

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(dayjs());

  const { data: todayData, isLoading: todayLoading } = useGetTodayStatusQuery();
  const { data: attendanceData, isLoading: attLoading } = useGetMyAttendanceQuery({ limit: 7 });
  const { data: overtimeData } = useGetMyOvertimeQuery({});

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = todayData?.attendance;
  const recentRecords = attendanceData?.attendances || [];
  const overtimeRequests = overtimeData?.overtimes || [];
  const pendingOvertime = overtimeRequests.filter((o) => o.status === 'pending').length;

  if (todayLoading || attLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm">{now.format('dddd, MMMM D, YYYY')}</p>
        <h2 className="text-2xl font-bold mt-1">
          Good {now.hour() < 12 ? 'Morning' : now.hour() < 17 ? 'Afternoon' : 'Evening'},{' '}
          {user?.name?.split(' ')[0] || 'Employee'}!
        </h2>
        <p className="text-blue-200 text-sm mt-1">
          Current time: <span className="text-white font-mono font-semibold">{now.format('hh:mm:ss A')}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiClock}
          label="Punch In"
          value={today?.punchIn ? formatTime(today.punchIn) : '—'}
          color="bg-green-500"
        />
        <StatCard
          icon={FiClock}
          label="Punch Out"
          value={today?.punchOut ? formatTime(today.punchOut) : '—'}
          color="bg-red-500"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Hours Today"
          value={today?.punchIn && today?.punchOut ? calcHours(today.punchIn, today.punchOut) : '—'}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Pending OT"
          value={pendingOvertime}
          color="bg-yellow-500"
        />
      </div>

      {/* Today's Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiCalendar className="text-blue-600" /> Today's Attendance
        </h3>
        {today ? (
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <StatusBadge status={today.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Punch In</p>
              <p className="font-semibold">{formatTime(today.punchIn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Punch Out</p>
              <p className="font-semibold">{today.punchOut ? formatTime(today.punchOut) : 'Not yet'}</p>
            </div>
            {today.punchIn && today.punchOut && (
              <div>
                <p className="text-xs text-gray-500">Total Hours</p>
                <p className="font-semibold text-blue-600">{calcHours(today.punchIn, today.punchOut)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Validation</p>
              <span className={today.validationStatus === 'valid' ? 'badge-green' : today.validationStatus === 'invalid' ? 'badge-red' : 'badge-yellow'}>
                {today.validationStatus || 'Pending'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No attendance record for today. <a href="/employee/punch" className="text-blue-600 underline">Punch in now</a>.</p>
        )}
      </div>

      {/* Recent Attendance Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance (Last 7 Days)</h3>
        {recentRecords.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((rec) => (
                  <tr key={rec._id}>
                    <td>{formatDate(rec.date)}</td>
                    <td>{formatTime(rec.punchIn)}</td>
                    <td>{formatTime(rec.punchOut)}</td>
                    <td>{rec.punchIn && rec.punchOut ? calcHours(rec.punchIn, rec.punchOut) : '—'}</td>
                    <td><StatusBadge status={rec.status} /></td>
                    <td>
                      <span className={rec.validationStatus === 'valid' ? 'badge-green' : rec.validationStatus === 'invalid' ? 'badge-red' : 'badge-yellow'}>
                        {rec.validationStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent attendance records found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
