import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../../api/vendor';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const VendorContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['vendor-contract', id],
    queryFn: () => vendorApi.contracts.get(id!),
    enabled: !!id,
  });

  const signMutation = useMutation({
    mutationFn: () => vendorApi.contracts.sign(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contract', id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
      toast.success('Contract signed successfully');
    },
  });

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (!contract) return <p className="text-center text-gray-500 py-12">Contract not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{contract.contract_number}</p>
        </div>
        <div className="flex gap-2">
          {!contract.signed_by_vendor && contract.status === 'active' && (
            <button onClick={() => signMutation.mutate(undefined)} className="px-4 py-2 bg-zammsa-green text-white rounded-lg text-sm">Sign Contract</button>
          )}
          <button onClick={() => navigate('/vendor/contracts')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Contract Value</dt><dd className="font-medium text-lg">{contract.value?.toLocaleString()} {contract.currency}</dd></div>
              <div><dt className="text-gray-500">Duration</dt><dd className="font-medium">{contract.start_date ? new Date(contract.start_date).toLocaleDateString() : '-'} - {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : '-'}</dd></div>
              <div><dt className="text-gray-500">Signed by You</dt><dd className="font-medium">{contract.signed_by_vendor ? `Yes (${contract.signed_vendor_date ? new Date(contract.signed_vendor_date).toLocaleDateString() : ''})` : 'Pending'}</dd></div>
              <div><dt className="text-gray-500">Signed by Authority</dt><dd className="font-medium">{contract.signed_by_authority ? `Yes (${contract.signed_authority_date ? new Date(contract.signed_authority_date).toLocaleDateString() : ''})` : 'Pending'}</dd></div>
            </dl>
          </div>

          {contract.milestones?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
              <div className="space-y-3">
                {contract.milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(m.due_date).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {contract.contract_document && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document</h2>
              <button className="text-zammsa-green hover:underline text-sm">Download Contract</button>
            </div>
          )}

          {contract.amendments?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amendments</h2>
              <div className="space-y-2">
                {contract.amendments.map((a: any) => (
                  <div key={a.id} className="text-sm p-2 bg-gray-50 rounded">
                    <p className="font-medium">Amendment #{a.amendment_number}</p>
                    <p className="text-gray-600 text-xs">{a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorContractDetail;
