import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts';
import toast from 'react-hot-toast';

const ContractCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', contract_number: '', solicitation: '', vendor: '', vendor_name: '',
    value: 0, currency: 'ZMW', start_date: '', end_date: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => contractsApi.create(data),
    onSuccess: (res) => {
      toast.success('Contract created successfully');
      navigate(`/contracts/${res.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create Contract</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contract Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Number</label>
              <input type="text" value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Solicitation ID</label>
              <input type="text" value={form.solicitation} onChange={(e) => setForm({ ...form, solicitation: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
              <input type="text" value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
              <input type="text" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} min={0} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green">
                <option value="ZMW">ZMW</option><option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-zammsa-green focus:border-zammsa-green" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/contracts')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="px-6 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-zammsa-green-dark disabled:opacity-50">
            {mutation.isPending ? 'Creating...' : 'Create Contract'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractCreate;
