import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { requisitionsApi } from '../../api/requisitions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import DepartmentSelect from '../common/DepartmentSelect';

const RequisitionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: req, isLoading } = useQuery({
    queryKey: ['requisition', id],
    queryFn: () => requisitionsApi.get(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState<any>({});
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (req) {
      setForm({
        title: req.title, description: req.description || '', department: req.department,
        priority: req.priority, currency: req.currency, procurement_method: req.procurement_method,
        date_required: req.date_required || '', notes: req.notes || '',
      });
      setItems(req.items?.map((i: any) => ({
        item_code: i.item_code, description: i.description,
        quantity: i.quantity, unit: i.unit, estimated_unit_cost: i.estimated_unit_cost,
      })) || []);
    }
  }, [req]);

  const addItem = () => setItems([...items, { item_code: '', description: '', quantity: 1, unit: 'each', estimated_unit_cost: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const mutation = useMutation({
    mutationFn: (data: any) => requisitionsApi.update(id!, data),
    onSuccess: () => {
      toast.success('Requisition updated');
      navigate(`/requisitions/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = items.reduce((sum, item) => sum + item.quantity * item.estimated_unit_cost, 0);
    mutation.mutate({ ...form, estimated_value: total, items });
  };

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (!req) return <p className="text-center text-gray-500 py-12">Requisition not found</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Requisition</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Requisition Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <DepartmentSelect value={form.department || ''} onChange={(v) => setForm({ ...form, department: v })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority || 'medium'} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Method</label>
              <select value={form.procurement_method || 'open'} onChange={(e) => setForm({ ...form, procurement_method: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green">
                <option value="open">Open Tender</option><option value="limited">Limited Bidding</option><option value="direct">Direct Procurement</option><option value="request">Request for Quotation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={form.currency || 'ZMW'} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green">
                <option value="ZMW">ZMW</option><option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Required</label>
              <input type="date" value={form.date_required || ''} onChange={(e) => setForm({ ...form, date_required: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button type="button" onClick={addItem} className="text-sm text-zammsa-green hover:underline">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-6 gap-2">
                  <input type="text" placeholder="Code" value={item.item_code} onChange={(e) => updateItem(i, 'item_code', e.target.value)} className="border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="col-span-2 border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)} min={1} className="border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="text" placeholder="Unit" value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)} className="border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="number" placeholder="Unit Cost" value={item.estimated_unit_cost} onChange={(e) => updateItem(i, 'estimated_unit_cost', parseFloat(e.target.value) || 0)} min={0} step="0.01" className="border-gray-300 rounded px-2 py-1 text-sm" />
                </div>
                {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm mt-1">Remove</button>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(`/requisitions/${id}`)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="px-6 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-zammsa-green-dark disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequisitionEdit;
