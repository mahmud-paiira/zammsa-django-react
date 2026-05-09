import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchZPCDashboard, approveBER, rejectBER } from '../../api/dashboards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAppSelector } from '../../hooks/useRedux';

const ZPCDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const queryClient = useQueryClient();
  const [pollInterval] = useState(30000);
  const [comment, setComment] = useState('');
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['zpcDashboard'],
    queryFn: fetchZPCDashboard,
    refetchInterval: pollInterval,
  });

  const approveMut = useMutation({
    mutationFn: ({ id, c }: { id: string; c: string }) => approveBER(id, c),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['zpcDashboard'] }); toast.success('BER approved'); setActionTarget(null); setComment(''); },
    onError: (err: any) => toast.error(err?.message || 'Approval failed'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectBER(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['zpcDashboard'] }); toast.success('BER rejected'); setActionTarget(null); setRejectReason(''); },
    onError: (err: any) => toast.error(err?.message || 'Rejection failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ZPC Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
        </div>
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
      </div>

      {/* Pending BER Approvals */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending BER Approvals</h2>
        {data?.pending_ber_approvals && data.pending_ber_approvals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Submitted By</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Recommendations</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.pending_ber_approvals.map((ber) => (
                  <tr key={ber.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{ber.title}</td>
                    <td className="px-4 py-3 text-gray-600">{ber.submitted_by}<br /><span className="text-xs text-gray-400">{new Date(ber.submitted_at).toLocaleDateString()}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${ber.total_score >= 80 ? 'text-green-600' : ber.total_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {ber.total_score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{ber.recommendations}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setActionTarget({ id: ber.id, action: 'approve' })}
                          className="px-3 py-1.5 bg-zammsa-green text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >Approve</button>
                        <button onClick={() => setActionTarget({ id: ber.id, action: 'reject' })}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No pending BER approvals</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Contract Amendments */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Contract Amendments</h2>
          {data?.pending_amendments && data.pending_amendments.length > 0 ? (
            <div className="space-y-4">
              {data.pending_amendments.map((am) => (
                <div key={am.id} className="border border-gray-200 rounded-lg p-4 hover:border-zammsa-orange transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{am.contract}</p>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      am.variation_percentage > 20 ? 'bg-red-100 text-red-700' :
                      am.variation_percentage > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{am.variation_percentage.toFixed(1)}% variation</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{am.description}</p>
                  <p className="text-xs text-gray-400">Value change: ZMW {am.value_change.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No pending amendments</p>}
        </div>

        {/* Pending Non-Open Justifications */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Non-Open Justifications</h2>
          {data?.pending_justifications && data.pending_justifications.length > 0 ? (
            <div className="space-y-4">
              {data.pending_justifications.map((j) => (
                <div key={j.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{j.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{j.justification}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-gray-900">ZMW {j.amount.toLocaleString()}</span>
                    <button className="px-3 py-1 bg-zammsa-orange text-white text-xs rounded-lg hover:bg-orange-600 transition-colors">Review</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No pending justifications</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval History */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h2>
          {data?.approval_history && data.approval_history.length > 0 ? (
            <div className="space-y-3">
              {data.approval_history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${h.action === 'approved' ? 'bg-green-500' : h.action === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium capitalize">{h.action}</span> by {h.user}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No history</p>}
        </div>

        {/* Meeting Schedule */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
          {data?.upcoming_meetings && data.upcoming_meetings.length > 0 ? (
            <div className="space-y-3">
              {data.upcoming_meetings.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-zammsa-green/10 flex flex-col items-center justify-center text-zammsa-green">
                    <span className="text-xs font-bold">{new Date(m.date).toLocaleDateString('en', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{new Date(m.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.title}</p>
                    <p className="text-xs text-gray-400">{new Date(m.date).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No upcoming meetings</p>}
        </div>
      </div>

      {/* Approve Modal */}
      {actionTarget?.action === 'approve' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Approve BER</h3>
            <p className="text-sm text-gray-500 mt-2">Add approval comment (optional):</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-3"
              rows={3}
              placeholder="Enter comment..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setActionTarget(null); setComment(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => approveMut.mutate({ id: actionTarget.id, c: comment })} disabled={approveMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">{approveMut.isPending ? 'Processing...' : 'Approve'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionTarget?.action === 'reject' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Reject BER</h3>
            <p className="text-sm text-gray-500 mt-2">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-3"
              rows={3}
              placeholder="Enter reason..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setActionTarget(null); setRejectReason(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => rejectMut.mutate({ id: actionTarget.id, reason: rejectReason })} disabled={rejectMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{rejectMut.isPending ? 'Processing...' : 'Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZPCDashboard;
