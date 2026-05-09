import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ExportButton } from '../common/ExportButton';

const TreeNode = ({ node, onEdit, onDelete, onAddChild, depth }: { node: any; onEdit: (d: any) => void; onDelete: (id: string) => void; onAddChild: (id: string) => void; depth: number }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group" style={{ paddingLeft: `${depth * 20 + 8}px` }}>
        <button onClick={() => setExpanded(!expanded)} className="w-4 text-center text-gray-400 hover:text-gray-600">
          {hasChildren ? (expanded ? '∨' : '>') : '•'}
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{node.name}</span>
          <span className="text-xs text-gray-400">{node.code}</span>
          {node.head && <span className="text-xs text-gray-500">— {node.head}</span>}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${node.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{node.active ? 'Active' : 'Inactive'}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAddChild(node.id)} className="text-xs text-blue-600 hover:underline px-1">+Child</button>
          <button onClick={() => onEdit(node)} className="text-xs text-green-600 hover:underline px-1">Edit</button>
          <button onClick={() => onDelete(node.id)} className="text-xs text-red-600 hover:underline px-1" disabled={hasChildren}>Del</button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>{node.children.map((child: any) => <TreeNode key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} depth={depth + 1} />)}</div>
      )}
    </div>
  );
};

const DepartmentManagement: React.FC = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editDep, setEditDep] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', head: '', budget: 0 });

  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments });

  const createMut = useMutation({
    mutationFn: () => createDepartment({ ...form, parent_id: parentId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department created'); setShowForm(false); resetForm(); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: () => editDep && updateDepartment(editDep.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department updated'); setEditDep(null); resetForm(); },
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department deleted'); },
    onError: (err: any) => toast.error(err?.message || 'Cannot delete with sub-departments'),
  });

  const resetForm = () => setForm({ name: '', code: '', head: '', budget: 0 });

  if (isLoading) return <LoadingSpinner />;

  const rootDeps = (() => {
    if (!data) return [];
    const map = new Map<string, any>();
    data.forEach((d: any) => map.set(d.id, { ...d, children: [] }));
    const roots: any[] = [];
    map.forEach((d) => {
      if (d.parent_id && map.has(d.parent_id)) {
        map.get(d.parent_id)!.children.push(d);
      } else {
        roots.push(d);
      }
    });
    return roots;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
        <div className="flex items-center gap-2">
          <ExportButton data={data || []} filename="departments" />
          <button onClick={() => { resetForm(); setParentId(null); setShowForm(true); }} className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700">+ Add Department</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        {rootDeps.length > 0 ? (
          <div className="space-y-1">
            {rootDeps.map((dep: any) => (
              <TreeNode key={dep.id} node={dep} onEdit={(d) => { setEditDep(d); setForm({ name: d.name, code: d.code || '', head: d.head || '', budget: d.budget || 0 }); }} onDelete={(id) => deleteMut.mutate(id)} onAddChild={(id) => { resetForm(); setParentId(id); setShowForm(true); }} depth={0} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-gray-400 text-sm">No departments configured</p>
              <button onClick={() => { resetForm(); setParentId(null); setShowForm(true); }} className="mt-2 text-sm text-zammsa-green hover:underline">Add your first department</button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {(showForm || editDep) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">{editDep ? 'Edit Department' : parentId ? 'Add Sub-department' : 'Add Department'}</h3>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Department Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. FIN)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} placeholder="Department Head" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} placeholder="Annual Budget" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditDep(null); resetForm(); setParentId(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => editDep ? updateMut.mutate() : createMut.mutate()} disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700 disabled:opacity-50">{editDep ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
