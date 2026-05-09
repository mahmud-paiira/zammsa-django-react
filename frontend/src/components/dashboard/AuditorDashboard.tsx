import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAuditorDashboard, fetchAuditLogs } from '../../api/dashboards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { ExportButton } from '../common/ExportButton';
import { useAppSelector } from '../../hooks/useRedux';

const AuditorDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [pollInterval] = useState(30000);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['auditorDashboard'],
    queryFn: fetchAuditorDashboard,
    refetchInterval: pollInterval,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['auditLogs', search, actionFilter, page],
    queryFn: () => fetchAuditLogs({ search, action: actionFilter || undefined, page, limit }),
    placeholderData: keepPreviousData,
  });

  if (summaryLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditor Dashboard</h1>
          <p className="text-sm text-gray-500">Read-Only Audit View • Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={logsData?.data || []} filename="audit-logs" />
          <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{summaryData?.summary.total_logs ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-green">
          <p className="text-sm text-gray-500">Today's Logs</p>
          <p className="text-2xl font-bold text-gray-900">{summaryData?.summary.today_logs ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Unique Users</p>
          <p className="text-2xl font-bold text-gray-900">{summaryData?.summary.unique_users ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Anomalies</p>
          <p className="text-2xl font-bold text-gray-900">{summaryData?.summary.anomalies ?? 0}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search logs by user, action, resource..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="view">View</option>
              <option value="export">Export</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {logsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Timestamp</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Resource</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logsData?.data && logsData.data.length > 0 ? (
                    logsData.data.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50 font-mono text-xs">
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{log.user}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            log.action === 'create' ? 'bg-green-100 text-green-700' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                            log.action === 'delete' ? 'bg-red-100 text-red-700' :
                            log.action === 'login' ? 'bg-purple-100 text-purple-700' :
                            log.action === 'approve' ? 'bg-zammsa-green/10 text-zammsa-green' :
                            log.action === 'reject' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.resource}</td>
                        <td className="px-4 py-3 text-gray-400">{log.ip}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No audit logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsData?.total && logsData.total > limit && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(logsData.total / limit)}
                  totalItems={logsData.total}
                  pageSize={limit}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Compliance Report */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Reports</h2>
        <div className="flex items-center gap-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Select report type...</option>
            <option>Access Log Summary</option>
            <option>User Activity Report</option>
            <option>Data Modification Report</option>
            <option>Security Compliance</option>
          </select>
          <button className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Activity</h2>
        {summaryData?.recent_logs && summaryData.recent_logs.length > 0 ? (
          <div className="space-y-3">
            {summaryData.recent_logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                  {l.user.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{l.user}</span> performed{' '}
                    <span className="font-medium">{l.action}</span> on{' '}
                    <span className="font-medium">{l.resource}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(l.timestamp).toLocaleString()} • IP: {l.ip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;
