import React, { useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchDepartmentDashboard, approveRequisition, rejectRequisition } from '../../api/dashboards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAppSelector } from '../../hooks/useRedux';

const PIE_COLORS = ['#008542', '#EF7E1A', '#3B82F6'];

const DepartmentHeadDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const queryClient = useQueryClient();
  const [pollInterval] = useState(30000);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['departmentDashboard'],
    queryFn: fetchDepartmentDashboard,
    refetchInterval: pollInterval,
  });

  const approveMut = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => approveRequisition(id, comment),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departmentDashboard'] }); toast.success('Requisition approved'); },
    onError: (err: any) => toast.error(err?.message || 'Approval failed'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectRequisition(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departmentDashboard'] }); toast.success('Requisition rejected'); setRejectId(null); setRejectReason(''); },
    onError: (err: any) => toast.error(err?.message || 'Rejection failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  const budgetPie = data?.budget_utilization
    ? [
        { name: 'Spent', value: data.budget_utilization.spent },
        { name: 'Remaining', value: data.budget_utilization.remaining },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Head Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
        </div>
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
      </div>

      {/* Budget Overview */}
      {data?.budget_utilization && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-green">
            <p className="text-sm text-gray-500">Allocated Budget</p>
            <p className="text-2xl font-bold text-gray-900">ZMW {data.budget_utilization.allocated.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-orange">
            <p className="text-sm text-gray-500">Spent</p>
            <p className="text-2xl font-bold text-gray-900">ZMW {data.budget_utilization.spent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">ZMW {data.budget_utilization.remaining.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Chart */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h2>
          {budgetPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={budgetPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label>
                  {budgetPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data</p>}
          {data?.budget_utilization && (
            <div className="mt-2 text-center">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-zammsa-green h-3 rounded-full"
                  style={{ width: `${Math.min((data.budget_utilization.spent / data.budget_utilization.allocated) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((data.budget_utilization.spent / data.budget_utilization.allocated) * 100).toFixed(1)}% utilized
              </p>
            </div>
          )}
        </div>

        {/* Staff Summary */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Requisitions Summary</h2>
          {data?.staff_summary && data.staff_summary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Staff</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">Approved</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.staff_summary.map((s) => (
                    <tr key={s.staff} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900">{s.staff}</td>
                      <td className="px-3 py-2 text-center">{s.total}</td>
                      <td className="px-3 py-2 text-center text-green-600 font-medium">{s.approved}</td>
                      <td className="px-3 py-2 text-center text-yellow-600 font-medium">{s.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No staff data</p>}
        </div>

        {/* Approval Workflow */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflow</h2>
          <div className="flex flex-col items-center gap-4 py-4">
            {['Submitted', 'HoD Review', 'Procurement', 'DG Approval', 'Processed'].map((step, i) => (
              <div key={step} className="flex items-center gap-3 w-full">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= 0 ? 'bg-zammsa-green text-white' : 'bg-gray-200 text-gray-500'
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${i <= 0 ? 'text-zammsa-green' : 'text-gray-500'}`}>{step}</p>
                </div>
                {i < 4 && <div className={`w-1 h-8 ${i <= 0 ? 'bg-zammsa-green' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Requisitions */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requisitions for Approval</h2>
        {data?.pending_requisitions && data.pending_requisitions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Requester</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Value</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Priority</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.pending_requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{req.title}</td>
                    <td className="px-4 py-3 text-gray-600">{req.requester}</td>
                    <td className="px-4 py-3 text-right">ZMW {req.estimated_value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        req.priority === 'high' ? 'bg-red-100 text-red-700' :
                        req.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>{req.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => approveMut.mutate({ id: req.id, comment: '' })}
                          disabled={approveMut.isPending}
                          className="px-3 py-1.5 bg-zammsa-green text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >Approve</button>
                        <button
                          onClick={() => setRejectId(req.id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No pending requisitions</p>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Reject Requisition</h3>
            <p className="text-sm text-gray-500 mt-2">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-3"
              rows={3}
              placeholder="Enter reason for rejection..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => rejectMut.mutate({ id: rejectId, reason: rejectReason })} disabled={rejectMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{rejectMut.isPending ? 'Processing...' : 'Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentHeadDashboard;
