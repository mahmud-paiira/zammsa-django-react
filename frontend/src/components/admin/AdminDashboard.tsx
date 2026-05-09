import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminDashboard } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAppSelector } from '../../hooks/useRedux';

const statusColor = (s: string) => {
  if (s === 'healthy' || s === 'active' || s === 'online') return 'bg-green-500';
  if (s === 'warning' || s === 'degraded') return 'bg-yellow-500';
  return 'bg-red-500';
};

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [pollInterval] = useState(30000);

  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'], queryFn: fetchAdminDashboard, refetchInterval: pollInterval,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
        </div>
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data?.system_health && Object.entries(data.system_health).map(([k, v]) => (
          <div key={k} className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{k.replace('_', ' ')}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {typeof v === 'number' && k !== 'db_connections' ? `${v}%` : v}
            </p>
            {typeof v === 'number' && k !== 'db_connections' && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${v > 80 ? 'bg-red-500' : v > 60 ? 'bg-yellow-500' : 'bg-zammsa-green'}`} style={{ width: `${v}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Stats */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h2>
          {data?.user_stats && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.user_stats).map(([k, v]) => (
                <div key={k} className="text-center p-3 rounded-lg bg-gray-50">
                  <p className={`text-2xl font-bold ${k === 'suspended' ? 'text-red-600' : k === 'pending' ? 'text-yellow-600' : 'text-zammsa-green'}`}>{v}</p>
                  <p className="text-xs text-gray-500 capitalize">{k.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integration Health */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Health</h2>
          {data?.integrations && data.integrations.length > 0 ? (
            <div className="space-y-3">
              {data.integrations.map((i) => (
                <div key={i.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColor(i.status)}`} />
                    <span className="text-sm text-gray-700">{i.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(i.last_checked).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No integrations</p>}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
          {data?.pending_approvals_summary && data.pending_approvals_summary.length > 0 ? (
            <div className="space-y-3">
              {data.pending_approvals_summary.map((a) => (
                <div key={a.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{a.type}</span>
                  <span className="bg-zammsa-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">{a.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No pending approvals</p>}
        </div>
      </div>

      {/* Scheduled Jobs */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Jobs</h2>
        {data?.scheduled_jobs && data.scheduled_jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Job</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Last Run</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Next Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.scheduled_jobs.map((j) => (
                  <tr key={j.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{j.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${j.status === 'running' ? 'bg-green-100 text-green-700' : j.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{j.last_run ? new Date(j.last_run).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{j.next_run ? new Date(j.next_run).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No scheduled jobs</p>}
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Logs</h2>
        {data?.recent_audit_logs && data.recent_audit_logs.length > 0 ? (
          <div className="space-y-2">
            {data.recent_audit_logs.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center gap-3 text-sm pb-2 border-b border-gray-100 last:border-0">
                <span className={`w-2 h-2 rounded-full ${l.action === 'create' ? 'bg-green-500' : l.action === 'update' ? 'bg-blue-500' : l.action === 'delete' ? 'bg-red-500' : 'bg-gray-500'}`} />
                <span className="font-medium text-gray-900">{l.user}</span>
                <span className="text-gray-500">{l.action}</span>
                <span className="text-gray-600">{l.resource}</span>
                <span className="ml-auto text-xs text-gray-400">{new Date(l.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No recent audit logs</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
