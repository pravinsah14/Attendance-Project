import React, { useState } from 'react';
import {
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
} from '../../features/attendance/attendanceApi';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiBarChart2, FiSearch, FiDownload } from 'react-icons/fi';
import { formatDate, formatTime, calcHours } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const AttendanceReport = () => {
  const { role } = useAuth();
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [trigger, setTrigger] = useState({ startDate, endDate });

  const isEmployee = role === 'employee';
  const isManager = role === 'manager';

  const { data: myData, isFetching: myFetching } = useGetMyAttendanceQuery(
    { startDate: trigger.startDate, endDate: trigger.endDate },
    { skip: !isEmployee }
  );
  const { data: teamData, isFetching: teamFetching } = useGetTeamAttendanceQuery(
    { startDate: trigger.startDate, endDate: trigger.endDate },
    { skip: !isManager }
  );
  const { data: allData, isFetching: allFetching } = useGetAllAttendanceQuery(
    { startDate: trigger.startDate, endDate: trigger.endDate },
    { skip: role !== 'admin' }
  );

  const isFetching = myFetching || teamFetching || allFetching;
  const records = isEmployee
    ? myData?.attendances || []
    : isManager
    ? teamData?.attendances || []
    : allData?.attendances || [];

  const handleGenerate = () => {
    setTrigger({ startDate, endDate });
  };

  const totalPresent = records.filter((r) => r.punchIn).length;
  const totalCompleted = records.filter((r) => r.status === 'completed').length;
  const totalPending = records.filter((r) => r.validationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiBarChart2 className="text-blue-600" /> Attendance Report
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isEmployee ? 'Your attendance history' : isManager ? 'Team attendance report' : 'All employees attendance report'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="input"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="btn-primary flex items-center gap-2"
          >
            <FiSearch size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{totalPresent}</p>
            <p className="text-sm text-gray-500 mt-1">Days Present</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{totalCompleted}</p>
            <p className="text-sm text-gray-500 mt-1">Completed Days</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">{totalPending}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Validations</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        {isFetching ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="md" text="Generating report..." />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiBarChart2 size={40} className="mx-auto mb-3" />
            <p>No attendance records found for the selected period.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {!isEmployee && <th>Employee</th>}
                  {!isEmployee && <th>Department</th>}
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    {!isEmployee && <td className="font-medium">{rec.employee?.name || '—'}</td>}
                    {!isEmployee && <td className="text-gray-500">{rec.employee?.department || '—'}</td>}
                    <td>{formatDate(rec.date)}</td>
                    <td>{formatTime(rec.punchIn)}</td>
                    <td>{formatTime(rec.punchOut)}</td>
                    <td>
                      {rec.punchIn && rec.punchOut ? (
                        <span className="font-medium text-blue-600">{calcHours(rec.punchIn, rec.punchOut)}</span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={
                        rec.status === 'completed' ? 'badge-green' :
                        rec.status === 'incomplete' ? 'badge-yellow' : 'badge-red'
                      }>
                        {rec.status || 'Absent'}
                      </span>
                    </td>
                    <td>
                      <span className={
                        rec.validationStatus === 'valid' ? 'badge-green' :
                        rec.validationStatus === 'invalid' ? 'badge-red' : 'badge-yellow'
                      }>
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

export default AttendanceReport;
