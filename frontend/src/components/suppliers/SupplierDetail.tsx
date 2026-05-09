import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../../api/suppliers';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersApi.get(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: (comment: string) => suppliersApi.approve(id!, { comment }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['supplier', id] }); toast.success('Supplier approved'); },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => suppliersApi.reject(id!, { reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['supplier', id] }); toast.success('Supplier rejected'); },
  });

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (!supplier) return <p className="text-center text-gray-500 py-12">Supplier not found</p>;

  const canApprove = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'system_admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{supplier.company_name}</h1>
            <StatusBadge status={supplier.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">Reg: {supplier.registration_number} | Tax: {supplier.tax_id}</p>
        </div>
        {canApprove && supplier.status === 'pending' && (
          <div className="flex gap-2">
            <button onClick={() => approveMutation.mutate('')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Approve</button>
            <button onClick={() => { const r = prompt('Reason for rejection:'); if (r) rejectMutation.mutate(r); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Reject</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Contact Person</dt><dd className="font-medium">{supplier.contact_person}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{supplier.email}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{supplier.phone}</dd></div>
              <div><dt className="text-gray-500">Business Type</dt><dd className="font-medium">{supplier.business_type}</dd></div>
              <div><dt className="text-gray-500">Risk Score</dt><dd className="font-medium">{supplier.risk_score}/100</dd></div>
              <div><dt className="text-gray-500">Performance Score</dt><dd className="font-medium">{supplier.performance_score}/100</dd></div>
            </dl>
            <p className="mt-4 text-sm text-gray-700">{supplier.address}</p>
          </div>

          {supplier.categories?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {supplier.categories.map((cat: string) => (
                  <span key={cat} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {supplier.documents?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {supplier.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
                    <span>{doc.filename}</span>
                    <button className="text-zammsa-green hover:underline">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Registered: {new Date(supplier.registered_at).toLocaleDateString()}</span>
              </div>
              {supplier.approved_at && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Approved: {new Date(supplier.approved_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
