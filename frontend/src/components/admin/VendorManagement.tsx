import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { fetchVendors, updateVendor, suspendVendor } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { ExportButton } from '../common/ExportButton';

const VendorManagement: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ceecFilter, setCeecFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [selected, setSelected] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [showSuspend, setShowSuspend] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminVendors', search, statusFilter, ceecFilter, page, limit],
    queryFn: () => fetchVendors({ search, status: statusFilter || undefined, ceec_category: ceecFilter || undefined, page, limit }),
  });

  const updateMut = useMutation({
    mutationFn: () => updateVendor(selected.supplier_id, editForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminVendors'] }); toast.success('Vendor updated'); setEditForm(null); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const suspendMut = useMutation({
    mutationFn: () => suspendVendor(selected.supplier_id, suspendReason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminVendors'] }); toast.success('Vendor suspended'); setShowSuspend(false); setSuspendReason(''); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <ExportButton data={data?.data || []} filename="vendors" />
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search vendors..." className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="pending">Pending</option><option value="debarred">Debarred</option></select>
          <select value={ceecFilter} onChange={(e) => { setCeecFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">All CEEC</option><option value="citizen">Citizen</option><option value="youth">Youth</option><option value="women">Women</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Company</th><th className="px-4 py-3 text-left font-medium text-gray-500">Reg No</th><th className="px-4 py-3 text-left font-medium text-gray-500">CEEC</th><th className="px-4 py-3 text-center font-medium text-gray-500">Risk</th><th className="px-4 py-3 text-center font-medium text-gray-500">Status</th><th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data?.map((v: any) => (
                <tr key={v.supplier_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                  <td className="px-4 py-3 text-gray-600">{v.registration_number}</td>
                  <td className="px-4 py-3 text-gray-600">{v.ceec_category || '-'}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.risk_level === 'low' ? 'bg-green-100 text-green-700' : v.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{v.risk_level || 'N/A'}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700' : v.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{v.status}</span></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelected(v)} className="text-xs text-blue-600 hover:underline">View</button>
                      <button onClick={() => { setSelected(v); setEditForm({ name: v.name }); }} className="text-xs text-green-600 hover:underline">Edit</button>
                      <button onClick={() => { setSelected(v); setShowSuspend(true); }} className="text-xs text-red-600 hover:underline">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.total && data.total > limit && (
          <div className="mt-4"><Pagination currentPage={page} totalPages={Math.ceil(data.total / limit)} totalItems={data.total} pageSize={limit} onPageChange={setPage} onPageSizeChange={(s) => { setLimit(s); setPage(1); }} /></div>
        )}
      </div>

      {/* View/Edit Modal */}
      {selected && !showSuspend && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{selected.company_name}</h2>
              <button onClick={() => { setSelected(null); setEditForm(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {editForm ? (
              <div className="space-y-3">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Company Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">Save</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3"><p className="text-sm text-gray-500">Registration: <span className="text-gray-900">{selected.registration_number}</span></p><p className="text-sm text-gray-500">TIN: <span className="text-gray-900">{selected.tin || '-'}</span></p><p className="text-sm text-gray-500">CEEC: <span className="text-gray-900">{selected.ceec_category || '-'}</span></p><p className="text-sm text-gray-500">Status: <span className="text-gray-900">{selected.status}</span></p></div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Performance History</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[{ month: 'Jan', value: 4 }, { month: 'Feb', value: 3 }, { month: 'Mar', value: 6 }, { month: 'Apr', value: 2 }, { month: 'May', value: 5 }, { month: 'Jun', value: 7 }]}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#008542" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspend && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Suspend Vendor</h3>
            <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." rows={3} className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-3" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowSuspend(false); setSuspendReason(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => suspendMut.mutate()} disabled={suspendMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
