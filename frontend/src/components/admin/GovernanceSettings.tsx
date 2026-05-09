import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchGovernanceSettings, requestChange, approveChange, rejectChange, fetchChangeRequests } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';

const CATEGORIES = ['procurement', 'financial', 'compliance', 'general', 'system'];

const GovernanceSettings: React.FC = () => {
  const qc = useQueryClient();
  const [category, setCategory] = useState('procurement');
  const [showRequest, setShowRequest] = useState<any>(null);
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [crStatus, setCrStatus] = useState('pending');
  const [selectedCr, setSelectedCr] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['governanceSettings', category],
    queryFn: () => fetchGovernanceSettings({ category }),
  });

  const { data: crData } = useQuery({
    queryKey: ['changeRequests', crStatus],
    queryFn: () => fetchChangeRequests({ status: crStatus }),
  });

  const reqMut = useMutation({
    mutationFn: () => requestChange({ setting_id: showRequest.id, new_value: newValue, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['changeRequests'] }); toast.success('Change requested'); setShowRequest(null); setNewValue(''); setReason(''); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  const approveCrMut = useMutation({
    mutationFn: (id: string) => approveChange(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['changeRequests'] }); toast.success('Change approved'); setSelectedCr(null); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  const rejectCrMut = useMutation({
    mutationFn: ({ id, reason: r }: { id: string; reason: string }) => rejectChange(id, r),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['changeRequests'] }); toast.success('Change rejected'); setSelectedCr(null); setRejectReason(''); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Governance Settings</h1>

      {/* Configurable Parameters */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${category === c ? 'border-zammsa-green text-zammsa-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{c}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Key</th><th className="px-4 py-3 text-left font-medium text-gray-500">Value</th><th className="px-4 py-3 text-left font-medium text-gray-500">Description</th><th className="px-4 py-3 text-right font-medium text-gray-500">Updated</th><th className="px-4 py-3 text-center font-medium text-gray-500">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {settingsData?.data?.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">{s.key}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[200px] truncate">{s.value}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{s.description}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setShowRequest(s); setNewValue(s.value); setReason(''); }} className="text-xs text-blue-600 hover:underline">Request Change</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Requests */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Change Requests</h2>
          <select value={crStatus} onChange={(e) => setCrStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
        </div>
        {crData?.data && crData.data.length > 0 ? (
          <div className="space-y-3">
            {crData.data.map((cr: any) => (
              <div key={cr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm text-gray-900 font-mono">{cr.setting_key}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cr.status === 'approved' ? 'bg-green-100 text-green-700' : cr.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{cr.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-2">
                  <div><span className="text-gray-400">Old:</span> {cr.old_value}</div>
                  <div><span className="text-gray-400">New:</span> {cr.new_value}</div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Requested by {cr.requested_by} on {new Date(cr.requested_at).toLocaleDateString()}</span>
                  {cr.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedCr(cr)} className="text-green-600 hover:underline font-medium">Approve</button>
                      <button onClick={() => { setSelectedCr(cr); setRejectReason(''); }} className="text-red-600 hover:underline font-medium">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No change requests</p>}

        {/* Two-person Approval Workflow */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Approval Workflow</p>
          <div className="flex items-center gap-2 text-xs">
            {['Request Submitted', 'Level 1 Approval', 'Level 2 Approval', 'Applied'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-1"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-zammsa-green text-white' : i < 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div><span className="text-gray-600">{step}</span></div>
                {i < 3 && <div className="w-4 h-0.5 bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Request Change Modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Request Change</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{showRequest.key}</p>
            <div className="mt-4 space-y-3">
              <div><label className="text-xs text-gray-500">Current Value</label><p className="text-sm font-mono bg-gray-50 p-2 rounded border">{showRequest.value}</p></div>
              <div><label className="text-xs text-gray-500">New Value</label><input value={newValue} onChange={(e) => setNewValue(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Reason for Change</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRequest(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => reqMut.mutate()} disabled={reqMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {selectedCr && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">{rejectReason ? 'Reject Change' : 'Approve Change'}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{selectedCr.setting_key}: {selectedCr.old_value} → {selectedCr.new_value}</p>
            {rejectReason !== undefined && (
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason..." rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3" />
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setSelectedCr(null); setRejectReason(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => rejectReason ? rejectCrMut.mutate({ id: selectedCr.id, reason: rejectReason }) : approveCrMut.mutate(selectedCr.id)} disabled={approveCrMut.isPending || rejectCrMut.isPending} className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${rejectReason ? 'bg-red-600 hover:bg-red-700' : 'bg-zammsa-green hover:bg-green-700'}`}>{rejectReason ? 'Reject' : 'Approve'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceSettings;
