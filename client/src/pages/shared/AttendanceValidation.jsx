import React, { useState } from 'react';
import {
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
  useValidateAttendanceMutation,
} from '../../features/attendance/attendanceApi';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiCheckSquare, FiEye, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { formatDate, formatTime, calcHours } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const SelfieModal = ({ src, onClose }) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="font-semibold">Selfie Preview</p>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><FiX size={20} /></button>
      </div>
      {src ? (
        <img src={src} alt="Employee selfie" className="w-full object-contain max-h-[70vh]" />
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-400">No selfie available</div>
      )}
    </div>
  </div>
);

const AttendanceValidation = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const { data: teamData, isFetching: teamFetching } = useGetTeamAttendanceQuery(
    { validationStatus: 'pending' },
    { skip: isAdmin }
  );
  const { data: allData, isFetching: allFetching } = useGetAllAttendanceQuery(
    { validationStatus: 'pending' },
    { skip: !isAdmin }
  );
  const [validateAttendance, { isLoading: validating }] = useValidateAttendanceMutation();

  const [selfieModal, setSelfieModal] = useState(null);
  const [decisions, setDecisions] = useState({}); // { [id]: { validationStatus, remarks } }
  const [submittingId, setSubmittingId] = useState(null);

  const isFetching = teamFetching || allFetching;
  const records = isAdmin
    ? allData?.attendances || []
    : teamData?.attendances || [];

  const pendingRecords = records.filter((r) => r.validationStatus === 'pending');

  const updateDecision = (id, field, value) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSubmit = async (id) => {
    const decision = decisions[id];
    if (!decision?.validationStatus) {
      toast.error('Please select a validation decision.');
      return;
    }
    setSubmittingId(id);
    try {
      await validateAttendance({
        id,
        validationStatus: decision.validationStatus,
        remarks: decision.remarks || '',
      }).unwrap();
      toast.success('Attendance validated!');
      setDecisions((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      toast.error(err?.data?.message || 'Validation failed.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading attendance records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiCheckSquare className="text-blue-600" /> Attendance Validation
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {pendingRecords.length} pending validation{pendingRecords.length !== 1 ? 's' : ''}
        </p>
      </div>

      {pendingRecords.length === 0 ? (
        <div className="card text-center py-16">
          <FiCheck className="text-green-400 mx-auto mb-3" size={48} />
          <p className="text-lg font-medium text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400">No pending attendance records to validate.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Hours</th>
                  <th>Selfie</th>
                  <th>Decision</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRecords.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <div>
                        <p className="font-medium">{rec.employee?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{rec.employee?.department || ''}</p>
                      </div>
                    </td>
                    <td>{formatDate(rec.date)}</td>
                    <td>{formatTime(rec.punchIn)}</td>
                    <td>{formatTime(rec.punchOut)}</td>
                    <td>{rec.punchIn && rec.punchOut ? calcHours(rec.punchIn, rec.punchOut) : '—'}</td>
                    <td>
                      {rec.selfie ? (
                        <button
                          onClick={() => setSelfieModal(rec.selfie)}
                          className="group relative"
                          title="View selfie"
                        >
                          <img
                            src={rec.selfie}
                            alt="selfie thumb"
                            className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                          />
                          <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <FiEye className="text-white opacity-0 group-hover:opacity-100" size={14} />
                          </div>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No selfie</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={decisions[rec._id]?.validationStatus || ''}
                        onChange={(e) => updateDecision(rec._id, 'validationStatus', e.target.value)}
                        className="input text-sm py-1 w-28"
                      >
                        <option value="">Select...</option>
                        <option value="valid">Valid</option>
                        <option value="invalid">Invalid</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={decisions[rec._id]?.remarks || ''}
                        onChange={(e) => updateDecision(rec._id, 'remarks', e.target.value)}
                        className="input text-sm py-1 w-32"
                        placeholder="Remarks..."
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleSubmit(rec._id)}
                        disabled={validating && submittingId === rec._id}
                        className="btn-primary py-1 px-3 text-sm flex items-center gap-1"
                      >
                        {validating && submittingId === rec._id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FiCheck size={14} />
                        )}
                        Submit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selfieModal && (
        <SelfieModal src={selfieModal} onClose={() => setSelfieModal(null)} />
      )}
    </div>
  );
};

export default AttendanceValidation;
