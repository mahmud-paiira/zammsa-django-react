import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchUsers, createUser, updateUser, resetUserPassword, toggleUserStatus, fetchUserAuditHistory } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { ExportButton } from '../common/ExportButton';
import DepartmentSelect from '../common/DepartmentSelect';

const UserManagement: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState<any>(null);
  const [form, setForm] = useState({ full_name: '', email: '', role: '', department: '', phone: '', employee_id: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, roleFilter, statusFilter, page, limit],
    queryFn: () => fetchUsers({ search, role: roleFilter || undefined, status: statusFilter || undefined, page, limit }),
  });

  const createMut = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success('User created'); setShowCreate(false); resetForm(); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: () => editUser && updateUser(editUser.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success('User updated'); setEditUser(null); resetForm(); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const resetPwdMut = useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
    onSuccess: () => { toast.success('Password reset email sent'); setShowPassword(null); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const toggleMut = useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success('Status toggled'); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const auditMut = useMutation({
    mutationFn: (id: string) => fetchUserAuditHistory(id),
    onSuccess: (d) => { setShowAudit(d); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  const resetForm = () => setForm({ full_name: '', email: '', role: '', department: '', phone: '', employee_id: '' });

  const openEdit = (u: any) => { setEditUser(u); setForm({ full_name: u.full_name, email: u.email, role: u.role, department: u.department || '', phone: u.phone || '', employee_id: u.employee_id || '' }); };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-2">
          <ExportButton data={data?.data || []} filename="users" />
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700 transition-colors">+ Create User</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">All Roles</option><option value="system_admin">System Administrator</option><option value="procurement_officer">Procurement Officer</option><option value="finance_officer">Finance Officer</option><option value="department_head">Department Head</option></select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="pending">Pending</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Name</th><th className="px-4 py-3 text-left font-medium text-gray-500">Email</th><th className="px-4 py-3 text-left font-medium text-gray-500">Role</th><th className="px-4 py-3 text-left font-medium text-gray-500">Department</th><th className="px-4 py-3 text-center font-medium text-gray-500">Status</th><th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data?.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-600">{u.department || '-'}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Suspended'}</span></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => setShowPassword(u.id)} className="text-xs text-yellow-600 hover:underline">Reset Pwd</button>
                      <button onClick={() => toggleMut.mutate(u.id)} className="text-xs text-red-600 hover:underline">{u.is_active ? 'Suspend' : 'Activate'}</button>
                      <button onClick={() => auditMut.mutate(u.id)} className="text-xs text-purple-600 hover:underline">Audit</button>
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

      {/* Create/Edit Modal */}
      {(showCreate || editUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">{editUser ? 'Edit User' : 'Create User'}</h3>
            <div className="mt-4 space-y-3">
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="Employee ID" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Select Role</option><option value="system_admin">System Administrator</option><option value="director_procurement">Director of Procurement</option><option value="procurement_officer">Procurement Officer</option><option value="procurement_manager">Procurement Manager</option><option value="finance_officer">Finance Officer</option><option value="budget_controller">Budget Controller</option><option value="department_head">Department Head</option><option value="user_dept_staff">User Department Staff</option><option value="evaluation_committee_member">Evaluation Committee Member</option><option value="evaluation_committee_chair">Evaluation Committee Chair</option><option value="contract_manager">Contract Manager</option><option value="supplier_relationship_manager">Supplier Relationship Manager</option><option value="supplier_user">Supplier User</option><option value="director_general">Director General</option><option value="zpc_member">ZPC Member</option><option value="auditor">Auditor</option><option value="zppa_reporting_officer">ZPPA Reporting Officer</option><option value="integration_manager">Integration Manager</option><option value="public_portal_viewer">Public Portal Viewer</option></select>
              <DepartmentSelect value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Department" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); setEditUser(null); resetForm(); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => editUser ? updateMut.mutate() : createMut.mutate()} disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">{editUser ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
            <p className="text-sm text-gray-500 mt-2">Send password reset email to this user?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowPassword(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => resetPwdMut.mutate(showPassword)} disabled={resetPwdMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50">Send Reset Email</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Audit History</h3>
              <button onClick={() => setShowAudit(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            {showAudit.length > 0 ? (
              <div className="space-y-2">
                {showAudit.map((a: any, i: number) => (
                  <div key={i} className="text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</span>
                    <span className="font-medium">{a.action}</span>
                    <span className="text-gray-500">{a.details || ''}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">No audit history</p>}
            <button onClick={() => setShowAudit(null)} className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
