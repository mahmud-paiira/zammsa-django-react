import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchFiscalYears, createFiscalYear, setCurrentFiscalYear, closeFiscalYear } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';

const FiscalYearManagement: React.FC = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '' });
  const [showClose, setShowClose] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['fiscalYears'], queryFn: fetchFiscalYears });

  const createMut = useMutation({
    mutationFn: () => createFiscalYear(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fiscalYears'] }); toast.success('Fiscal year created'); setShowCreate(false); setForm({ name: '', start_date: '', end_date: '' }); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const setCurrentMut = useMutation({
    mutationFn: (id: string) => setCurrentFiscalYear(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fiscalYears'] }); toast.success('Current fiscal year updated'); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const closeMut = useMutation({
    mutationFn: (id: string) => closeFiscalYear(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fiscalYears'] }); toast.success('Fiscal year closed'); setShowClose(null); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fiscal Year Management</h1>
        <button onClick={() => { setForm({ name: '', start_date: '', end_date: '' }); setShowCreate(true); }} className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700">+ Add Fiscal Year</button>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-500">Name</th><th className="px-4 py-3 text-left font-medium text-gray-500">Start Date</th><th className="px-4 py-3 text-left font-medium text-gray-500">End Date</th><th className="px-4 py-3 text-right font-medium text-gray-500">Budget</th><th className="px-4 py-3 text-right font-medium text-gray-500">Spent</th><th className="px-4 py-3 text-center font-medium text-gray-500">Status</th><th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.map((fy: any) => (
                <tr key={fy.id} className={`hover:bg-gray-50 ${fy.is_current ? 'bg-zammsa-green/5' : ''}`}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{fy.name}</span>
                    {fy.is_current && <span className="ml-2 text-xs bg-zammsa-green text-white px-2 py-0.5 rounded-full">Current</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(fy.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(fy.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">ZMW {fy.total_budget?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-right">ZMW {fy.total_spent?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fy.is_closed ? 'bg-red-100 text-red-700' : fy.is_current ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {fy.is_closed ? 'Closed' : fy.is_current ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!fy.is_current && !fy.is_closed && (
                        <button onClick={() => setCurrentMut.mutate(fy.id)} disabled={setCurrentMut.isPending} className="text-xs text-blue-600 hover:underline">Set Current</button>
                      )}
                      {!fy.is_closed && fy.is_current && (
                        <button onClick={() => setShowClose(fy.id)} className="text-xs text-red-600 hover:underline">Close Year</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Year-end Summary */}
      {data?.filter((fy: any) => fy.is_current).map((fy: any) => (
        <div key={`summary-${fy.id}`} className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Year-end Summary — {fy.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-sm text-gray-500">Total Budget</p><p className="text-xl font-bold text-gray-900">ZMW {fy.total_budget?.toLocaleString() || 0}</p></div>
            <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-sm text-gray-500">Total Spent</p><p className="text-xl font-bold text-zammsa-orange">ZMW {fy.total_spent?.toLocaleString() || 0}</p></div>
            <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-sm text-gray-500">Utilization</p><p className="text-xl font-bold text-zammsa-green">{fy.total_budget ? ((fy.total_spent / fy.total_budget) * 100).toFixed(1) : 0}%</p></div>
          </div>
        </div>
      ))}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Add Fiscal Year</h3>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. FY 2027" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <div><label className="text-xs text-gray-500">Start Date</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">End Date</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Year Modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Close Fiscal Year</h3>
            <p className="text-sm text-gray-500 mt-2">This will trigger the year-end rollover process. All pending budgets will be carried forward. This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowClose(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => closeMut.mutate(showClose)} disabled={closeMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{closeMut.isPending ? 'Processing...' : 'Close Year'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalYearManagement;
