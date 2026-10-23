import React from 'react';
import { useGetMyOvertimeQuery } from '../../features/overtime/overtimeApi';
import OvertimeCard from '../../components/OvertimeCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MdOutlineTimer } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';

const tabClass = (active) =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`;

const MyOvertime = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const { data, isLoading, isError } = useGetMyOvertimeQuery({});

  const all = data?.overtimes || [];
  const filtered =
    activeTab === 'all'
      ? all
      : all.filter((o) => o.status === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading overtime requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdOutlineTimer className="text-blue-600" /> My Overtime Requests
          </h2>
          <p className="text-gray-500 text-sm mt-1">Track all your overtime submissions</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(activeTab === tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'all' && ` (${all.length})`}
            {tab !== 'all' && ` (${all.filter((o) => o.status === tab).length})`}
          </button>
        ))}
      </div>

      {isError && (
        <div className="card bg-red-50 border border-red-200 text-red-700">
          Failed to load overtime requests.
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FiInbox size={48} className="mb-3" />
          <p className="text-lg font-medium">No overtime requests found</p>
          <p className="text-sm">
            {activeTab === 'all'
              ? 'Submit your first overtime request from the Punch page.'
              : `No ${activeTab} requests found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((request) => (
            <OvertimeCard key={request._id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOvertime;
