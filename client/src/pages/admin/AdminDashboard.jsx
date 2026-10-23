import React from 'react';
import { useGetAllAttendanceQuery } from '../../features/attendance/attendanceApi';
import { useGetUsersQuery } from '../../features/users/usersApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiUsers, FiCheckCircle, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';
import { formatTime, calcHours } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: attendanceData, isLoading: attLoading } = useGetAllAttendanceQuery({
    date: dayjs().format('YYYY-MM-DD'),
  });
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});

  const records = attendanceData?.attendances || [];
  const users = usersData?.users || [];
  const totalUsers = users.length;
  const totalEmployees = users.filter((u) => u.role === 'employee').length;
  const presentToday = records.filter((r) => r.punchIn).length;
  const pendingValidations = records.filter(
    (r) => r.validationStatus === 'pending' && r.punchIn
  ).length;

  if (attLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          System overview — {dayjs().format('dddd, MMMM D, YYYY')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Users" value={totalUsers} color="bg-blue-500" />
        <StatCard icon={FiUsers} label="Employees" value={totalEmployees} color="bg-purple-500" />
        <StatCard icon={FiCheckCircle} label="Present Today" value={presentToday} color="bg-green-500" />
        <StatCard icon={FiAlertCircle} label="Pending Validations" value={pendingValidations} color="bg-yellow-500" />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiBarChart2 className="text-blue-600" /> All Attendance — Today
        </h3>
        {records.length === 0 ? (
          <p className="text-gray-500 text-sm">No attendance records for today.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
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
                    <td className="capitalize">{rec.employee?.role || '—'}</td>
                    <td className="text-gray-500">{rec.employee?.department || '—'}</td>
                    <td>{formatTime(rec.punchIn)}</td>
                    <td>{formatTime(rec.punchOut)}</td>
                    <td>{rec.punchIn && rec.punchOut ? calcHours(rec.punchIn, rec.punchOut) : '—'}</td>
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

export default AdminDashboard;
