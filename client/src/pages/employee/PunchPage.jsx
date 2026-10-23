import React, { useState, useCallback } from 'react';
import {
  usePunchInMutation,
  usePunchOutMutation,
  useGetTodayStatusQuery,
} from '../../features/attendance/attendanceApi';
import { useRequestOvertimeMutation } from '../../features/overtime/overtimeApi';
import SelfieCapture from '../../components/SelfieCapture';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiLoader,
  FiLogIn, FiLogOut, FiCamera,
} from 'react-icons/fi';
import { MdOutlineTimer } from 'react-icons/md';
import { formatTime, calcHoursDecimal, calcHours } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const PunchPage = () => {
  const { data: todayData, isLoading } = useGetTodayStatusQuery();
  const [punchIn, { isLoading: punchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: punchingOut }] = usePunchOutMutation();
  const [requestOvertime, { isLoading: requestingOT }] = useRequestOvertimeMutation();

  const [selfie, setSelfie] = useState(null);
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Overtime modal
  const [showOTModal, setShowOTModal] = useState(false);
  const [otForm, setOTForm] = useState({ hoursRequested: '', reason: '' });

  const today = todayData?.attendance;
  const isPunchedIn = !!today?.punchIn && !today?.punchOut;
  const isPunchedOut = !!today?.punchIn && !!today?.punchOut;
  const workedHours = today?.punchIn && today?.punchOut
    ? calcHoursDecimal(today.punchIn, today.punchOut)
    : 0;
  const showOTButton = isPunchedOut && workedHours < 8;

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          address = data.display_name || address;
        } catch {}
        setLocation({ lat, lng, address });
        setFetchingLocation(false);
        toast.success('Location captured!');
      },
      (err) => {
        setFetchingLocation(false);
        toast.error('Failed to get location: ' + err.message);
      },
      { timeout: 10000 }
    );
  }, []);

  const handlePunchIn = async () => {
    if (!selfie) return toast.error('Please capture a selfie first.');
    if (!location) return toast.error('Please capture your location first.');
    try {
      await punchIn({ selfie, location }).unwrap();
      toast.success('Punched in successfully!');
      setSelfie(null);
      setLocation(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Punch in failed.');
    }
  };

  const handlePunchOut = async () => {
    try {
      await punchOut({}).unwrap();
      toast.success('Punched out successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Punch out failed.');
    }
  };

  const handleOTSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestOvertime({
        date: dayjs().format('YYYY-MM-DD'),
        hoursRequested: parseFloat(otForm.hoursRequested),
        reason: otForm.reason,
      }).unwrap();
      toast.success('Overtime request submitted!');
      setShowOTModal(false);
      setOTForm({ hoursRequested: '', reason: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit overtime request.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading attendance status..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Punch In / Out</h2>
        <p className="text-gray-500 text-sm mt-1">{dayjs().format('dddd, MMMM D, YYYY')}</p>
      </div>

      {/* Current Status */}
      <div className={`card border-l-4 ${isPunchedIn ? 'border-green-500' : isPunchedOut ? 'border-blue-500' : 'border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            {isPunchedIn && (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-semibold">Punched In</span>
              </div>
            )}
            {isPunchedOut && (
              <span className="text-blue-700 font-semibold flex items-center gap-2">
                <FiCheckCircle /> Completed for Today
              </span>
            )}
            {!today && (
              <span className="text-gray-600 font-semibold">Not Punched In Yet</span>
            )}
          </div>
          <FiClock className="text-gray-300" size={40} />
        </div>

        {today?.punchIn && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Punch In</p>
              <p className="font-semibold text-lg">{formatTime(today.punchIn)}</p>
            </div>
            {today?.punchOut && (
              <>
                <div>
                  <p className="text-gray-500">Punch Out</p>
                  <p className="font-semibold text-lg">{formatTime(today.punchOut)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Hours</p>
                  <p className="font-semibold text-lg text-blue-600">{calcHours(today.punchIn, today.punchOut)}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Punch In Form */}
      {!today && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Punch In</h3>

          {/* Selfie Capture */}
          <div>
            <label className="label mb-3 flex items-center gap-2">
              <FiCamera size={16} /> Capture Selfie <span className="text-red-500">*</span>
            </label>
            <SelfieCapture onCapture={setSelfie} />
          </div>

          {/* Location */}
          <div>
            <label className="label flex items-center gap-2">
              <FiMapPin size={16} /> Location <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={captureLocation}
              disabled={fetchingLocation}
              className="btn-secondary flex items-center gap-2 mt-2"
            >
              {fetchingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <FiMapPin size={16} />
                  {location ? 'Re-capture Location' : 'Capture Location'}
                </>
              )}
            </button>
            {location && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="text-green-700 font-medium flex items-center gap-1">
                  <FiCheckCircle size={14} /> Location captured
                </p>
                <p className="text-gray-600 text-xs mt-1">{location.address}</p>
                <p className="text-gray-400 text-xs">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handlePunchIn}
            disabled={punchingIn || !selfie || !location}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
          >
            {punchingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Punching In...
              </>
            ) : (
              <>
                <FiLogIn size={18} />
                Punch In
              </>
            )}
          </button>

          {!selfie && <p className="text-xs text-amber-600 flex items-center gap-1"><FiAlertCircle size={12} /> Selfie is required</p>}
          {!location && <p className="text-xs text-amber-600 flex items-center gap-1"><FiAlertCircle size={12} /> Location is required</p>}
        </div>
      )}

      {/* Punch Out */}
      {isPunchedIn && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to leave?</h3>
          <button
            type="button"
            onClick={handlePunchOut}
            disabled={punchingOut}
            className="btn-danger w-full py-3 flex items-center justify-center gap-2 text-base"
          >
            {punchingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Punching Out...
              </>
            ) : (
              <>
                <FiLogOut size={18} />
                Punch Out
              </>
            )}
          </button>
        </div>
      )}

      {/* Overtime Request */}
      {showOTButton && (
        <div className="card border border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-800">Working overtime today?</p>
              <p className="text-sm text-yellow-600 mt-0.5">
                You worked {workedHours.toFixed(1)}h. Request overtime compensation.
              </p>
            </div>
            <button
              onClick={() => setShowOTModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm flex-shrink-0"
            >
              <MdOutlineTimer size={16} />
              Request OT
            </button>
          </div>
        </div>
      )}

      {/* Overtime Modal */}
      {showOTModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Overtime</h3>
            <form onSubmit={handleOTSubmit} className="space-y-4">
              <div>
                <label className="label">Hours Requested</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={otForm.hoursRequested}
                  onChange={(e) => setOTForm({ ...otForm, hoursRequested: e.target.value })}
                  className="input"
                  placeholder="e.g. 2"
                  required
                />
              </div>
              <div>
                <label className="label">Reason</label>
                <textarea
                  value={otForm.reason}
                  onChange={(e) => setOTForm({ ...otForm, reason: e.target.value })}
                  className="input h-24 resize-none"
                  placeholder="Describe why overtime was needed..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={requestingOT} className="btn-primary flex-1">
                  {requestingOT ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOTModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchPage;
