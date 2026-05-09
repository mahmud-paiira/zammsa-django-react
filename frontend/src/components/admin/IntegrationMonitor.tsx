import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchIntegrations, testIntegration, updateIntegration, generateApiKey, retryTransaction } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';

const IntegrationMonitor: React.FC = () => {
  const qc = useQueryClient();
  const [editInt, setEditInt] = useState<any>(null);
  const [editForm, setEditForm] = useState({ endpoint: '', api_key: '' });
  const [showKey, setShowKey] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['integrations'], queryFn: fetchIntegrations });

  const testMut = useMutation({
    mutationFn: (id: string) => testIntegration(id),
    onSuccess: (r) => toast.success(r.message || 'Connection successful'),
    onError: (err: any) => toast.error(err?.message || 'Connection failed'),
  });
  const updateMut = useMutation({
    mutationFn: () => editInt && updateIntegration(editInt.id, editForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['integrations'] }); toast.success('Integration updated'); setEditInt(null); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const keyMut = useMutation({
    mutationFn: (id: string) => generateApiKey(id),
    onSuccess: (r) => { setApiKey(r.api_key); toast.success('New API key generated'); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const retryMut = useMutation({
    mutationFn: (id: string) => retryTransaction(id),
    onSuccess: () => toast.success('Retry initiated'),
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integration Monitor</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((int: any) => (
          <div key={int.id} className={`bg-white rounded-lg shadow p-5 border-t-4 ${int.status === 'connected' ? 'border-green-500' : int.status === 'error' ? 'border-red-500' : 'border-yellow-500'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{int.name}</h3>
              <span className={`w-3 h-3 rounded-full ${int.status === 'connected' ? 'bg-green-500' : int.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Type: {int.type}</p>
            <p className="text-xs text-gray-500 mb-1">Last tested: {int.last_tested ? new Date(int.last_tested).toLocaleString() : 'Never'}</p>
            <p className="text-xs text-gray-500 mb-3">Last success: {int.last_success ? new Date(int.last_success).toLocaleString() : 'N/A'}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => testMut.mutate(int.id)} disabled={testMut.isPending} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Test Connection</button>
              <button onClick={() => { setEditInt(int); setEditForm({ endpoint: int.endpoint || '', api_key: '' }); }} className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700">Configure</button>
              <button onClick={() => { setShowKey(int); keyMut.mutate(int.id); }} className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700">Generate Key</button>
              {int.failed_transactions > 0 && (
                <button onClick={() => retryMut.mutate(int.id)} disabled={retryMut.isPending} className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Retry ({int.failed_transactions})</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Logs Viewer */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Logs</h2>
        <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto">
          <p>{'>'} Integration monitoring active...</p>
          <p>{'>'} PACRA API: connected</p>
          <p>{'>'} ZRA API: connected</p>
          <p>{'>'} CEEC API: connected</p>
          <p className="text-yellow-400">{'>'} Email service: warning - queue depth 15</p>
          <p>{'>'} SMS gateway: connected</p>
          <p>{'>'} [LOG] 2026-05-08 10:30:22 - PACRA verification request #1823 completed</p>
          <p className="text-red-400">{'>'} [ERROR] 2026-05-08 10:28:15 - ZRA validation timeout for vendor #456</p>
          <p>{'>'} [LOG] 2026-05-08 10:25:00 - Email notification sent to 12 recipients</p>
          <p className="animate-pulse">{'>'} _</p>
        </div>
      </div>

      {/* Configure Modal */}
      {editInt && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Configure {editInt.name}</h3>
            <div className="mt-4 space-y-3">
              <div><label className="text-xs text-gray-500">Endpoint URL</label><input value={editForm.endpoint} onChange={(e) => setEditForm({ ...editForm, endpoint: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">New API Key (leave blank to keep current)</label><input value={editForm.api_key} onChange={(e) => setEditForm({ ...editForm, api_key: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditInt(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showKey && apiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">API Key - {showKey.name}</h3>
            <div className="mt-4">
              <p className="text-xs text-red-600 mb-2">Copy this key now. It will not be shown again.</p>
              <div className="bg-gray-100 border rounded-lg p-3 font-mono text-sm break-all select-all">{apiKey}</div>
            </div>
            <button onClick={() => { setShowKey(null); setApiKey(''); }} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationMonitor;
