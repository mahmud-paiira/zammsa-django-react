import React, { useState, useEffect } from 'react';
import { budgetApi } from '../../api/procurement_planning';
import { BudgetAllocation } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const BudgetAllocationList: React.FC = () => {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncModal, setSyncModal] = useState(false);
  const [syncData, setSyncData] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadAllocations();
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiscalYear]);

  const loadAllocations = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.list({ fiscal_year: fiscalYear, page_size: 100 });
      setAllocations(res.results);
    } catch { setAllocations([]); }
    setLoading(false);
  };

  const loadSummary = async () => {
    try {
      const res = await budgetApi.summary({ fiscal_year: fiscalYear });
      setSummary(res);
    } catch { setSummary(null); }
  };

  const handleSync = async () => {
    let allocations: any[];
    try { allocations = JSON.parse(syncData); }
    catch { toast.error('Invalid JSON format'); return; }
    if (!Array.isArray(allocations)) { toast.error('Must be an array'); return; }
    setSyncing(true);
    try {
      const res = await budgetApi.syncFromERP(allocations);
      toast.success(`Synced ${res.synced_count} allocations`);
      if (res.errors.length > 0) console.warn('Sync errors:', res.errors);
      setSyncModal(false);
      setSyncData('');
      loadAllocations();
      loadSummary();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Sync failed'); }
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Allocations</h1>
          <p className="text-sm text-gray-500">Manage annual budget allocations from ERP</p>
        </div>
        <button onClick={() => setSyncModal(true)} className="px-4 py-2 bg-zammsa-green text-white rounded-lg hover:bg-zammsa-green-dark text-sm font-medium">
          Sync from ERP
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Total Allocated</p>
            <p className="text-xl font-bold text-gray-900">ZMW {summary.total_allocated.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Encumbered</p>
            <p className="text-xl font-bold text-yellow-600">ZMW {summary.total_encumbered.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Expended</p>
            <p className="text-xl font-bold text-red-600">ZMW {summary.total_expended.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Available</p>
            <p className="text-xl font-bold text-green-600">ZMW {summary.total_available.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Fiscal Year:</label>
        <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} className="border border-gray-300 rounded-md text-sm px-3 py-1">
          {['2024', '2025', '2026', '2027'].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8"><LoadingSpinner /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allocated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Encumbered</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expended</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allocations.map((a) => (
                <tr key={a.allocation_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{a.entity_name || a.entity_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.entity_code}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{a.allocated_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right">{a.encumbered_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right">{a.expended_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{a.available.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-400">{a.last_synced_at ? new Date(a.last_synced_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {allocations.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No allocations found. Sync from ERP or create manually.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => budgetApi.create({ entity_code: 'NEW', entity_name: 'New Department', entity_level: 'department', fiscal_year: fiscalYear, allocated_amount: 0 } as any).then(() => { loadAllocations(); toast.success('Created'); }).catch(() => toast.error('Failed'))} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          + Add Manual Allocation
        </button>
      </div>

      {syncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-lg font-bold mb-2">Sync Budget from ERP</h2>
            <p className="text-sm text-gray-500 mb-4">Paste JSON array of budget allocations</p>
            <textarea value={syncData} onChange={(e) => setSyncData(e.target.value)} rows={10} className="w-full border border-gray-300 rounded-md p-3 text-sm font-mono" placeholder='[{"entity_code": "DEPT01", "fiscal_year": "2026", "allocated_amount": 5000000, "entity_name": "Pharmacy Department"}]' />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setSyncModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleSync} disabled={syncing} className="px-4 py-2 text-sm bg-zammsa-green text-white rounded-lg disabled:opacity-50">
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAllocationList;
