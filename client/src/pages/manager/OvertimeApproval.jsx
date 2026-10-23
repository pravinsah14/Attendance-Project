import React, { useState } from 'react';
import {
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} from '../../features/overtime/overtimeApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiInbox } from 'react-icons/fi';
import { MdOutlineTimer } from 'react-icons/md';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const OvertimeApproval = () => {
  const { data, isLoading } = useGetPendingOvertimeQuery({});
  const [reviewOvertime, { isLoading: reviewing }] = useReviewOvertimeMutation();
  const [notes, setNotes] = useState({});
  const [actionId, setActionId] = useState(null);

  const requests = data?.overtimes || [];

  const handleReview = async (id, status) => {
    setActionId(id);
    try {
      await reviewOvertime({ id, status, reviewNote: notes[id] || '' }).unwrap();
      toast.success(`Overtime ${status} successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed.');
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading overtime requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdOutlineTimer className="text-blue-600" /> Overtime Approvals
        </h2>
        <p className="text-gray-500 text-sm mt-1">Review and approve pending overtime requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FiInbox size={48} className="mb-3" />
          <p className="text-lg font-medium">No pending overtime requests</p>
          <p className="text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Reason</th>
                  <th>Submitted</th>
                  <th>Review Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div>
                        <p className="font-medium">{req.employee?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{req.employee?.department || ''}</p>
                      </div>
                    </td>
                    <td>{formatDate(req.date)}</td>
                    <td>
                      <span className="badge-blue">{req.hoursRequested}h</span>
                    </td>
                    <td className="max-w-xs">
                      <p className="text-sm truncate" title={req.reason}>{req.reason}</p>
                    </td>
                    <td className="text-xs text-gray-400">{formatDateTime(req.createdAt)}</td>
                    <td>
                      <input
                        type="text"
                        value={notes[req._id] || ''}
                        onChange={(e) => setNotes({ ...notes, [req._id]: e.target.value })}
                        className="input text-sm py-1 w-40"
                        placeholder="Optional note..."
                      />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(req._id, 'approved')}
                          disabled={reviewing && actionId === req._id}
                          className="btn-success py-1 px-3 flex items-center gap-1 text-sm"
                        >
                          <FiCheck size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReview(req._id, 'rejected')}
                          disabled={reviewing && actionId === req._id}
                          className="btn-danger py-1 px-3 flex items-center gap-1 text-sm"
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimeApproval;
