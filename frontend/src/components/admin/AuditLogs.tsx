import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { ExportButton } from '../common/ExportButton';


const PRESETS = [
  { label: 'Last 24h', days: 1 }, { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 }, { label: 'Last 90 days', days: 90 },
];

const AuditLogs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const applyPreset = (days: number) => {
    const e = new Date(); const s = new Date(Date.now() - days * 86400000);
    setStartDate(s.toISOString().split('T')[0]); setEndDate(e.toISOString().split('T')[0]); setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['adminAuditLogs', search, actionFilter, userFilter, moduleFilter, ipFilter, startDate, endDate, page, limit],
    queryFn: () => fetchAuditLogs({ search, action: actionFilter || undefined, user: userFilter || undefined, module: moduleFilter || undefined, ip: ipFilter || undefined, start_date: startDate || undefined, end_date: endDate || undefined, page, limit }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <div className="flex items-center gap-2">
          <ExportButton data={data?.data || []} filename="audit-logs" />
          <button onClick={() => window.print()} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Print</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Quick dates:</span>
          {PRESETS.map((p) => (
            <button key={p.days} onClick={() => applyPreset(p.days)} className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">{p.label}</button>
          ))}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs" />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">All Actions</option><option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option><option value="login">Login</option><option value="approve">Approve</option><option value="reject">Reject</option><option value="export">Export</option></select>
          <input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="User..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">All Modules</option><option value="auth">Auth</option><option value="users">Users</option><option value="vendors">Vendors</option><option value="solicitations">Solicitations</option><option value="bids">Bids</option><option value="contracts">Contracts</option><option value="finance">Finance</option></select>
          <input value={ipFilter} onChange={(e) => setIpFilter(e.target.value)} placeholder="IP Address..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr><th className="px-3 py-2 text-left font-medium text-gray-500">Timestamp</th><th className="px-3 py-2 text-left font-medium text-gray-500">User</th><th className="px-3 py-2 text-left font-medium text-gray-500">Action</th><th className="px-3 py-2 text-left font-medium text-gray-500">Resource</th><th className="px-3 py-2 text-left font-medium text-gray-500">Module</th><th className="px-3 py-2 text-left font-medium text-gray-500">IP</th><th className="px-3 py-2 text-center font-medium text-gray-500">Diff</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data?.map((log: any) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer font-mono" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium">{log.user}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded-full font-medium ${log.action === 'create' ? 'bg-green-100 text-green-700' : log.action === 'update' ? 'bg-blue-100 text-blue-700' : log.action === 'delete' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{log.action}</span></td>
                    <td className="px-3 py-2">{log.resource}#{log.resource_id?.slice(0, 8)}</td>
                    <td className="px-3 py-2">{log.module}</td>
                    <td className="px-3 py-2 text-gray-400">{log.ip}</td>
                    <td className="px-3 py-2 text-center">{log.old_value || log.new_value ? <span className="text-blue-600">{'>'}</span> : '-'}</td>
                  </tr>
                  {expanded === log.id && (log.old_value || log.new_value) && (
                    <tr key={`${log.id}-diff`} className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                          <div><p className="font-medium text-gray-500 mb-1">Old Value:</p><pre className="bg-white border rounded p-2 max-h-40 overflow-auto">{JSON.stringify(log.old_value || {}, null, 2)}</pre></div>
                          <div><p className="font-medium text-gray-500 mb-1">New Value:</p><pre className="bg-white border rounded p-2 max-h-40 overflow-auto">{JSON.stringify(log.new_value || {}, null, 2)}</pre></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {data?.total && data.total > limit && (
          <div className="mt-4"><Pagination currentPage={page} totalPages={Math.ceil(data.total / limit)} totalItems={data.total} pageSize={limit} onPageChange={setPage} onPageSizeChange={(s) => { setLimit(s); setPage(1); }} /></div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
