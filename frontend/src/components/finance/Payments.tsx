import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';

const Payments: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, pageSize, search],
    queryFn: () => financeApi.listPayments({ page, page_size: pageSize, search }),
  });

  const columns = [
    { key: 'reference', label: 'Reference', render: (v: string) => <span className="font-medium">{v || '-'}</span> },
    { key: 'invoice', label: 'Invoice' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'amount', label: 'Amount', render: (v: number) => v?.toLocaleString() },
    { key: 'payment_date', label: 'Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'payment_method', label: 'Method', render: (v: string) => v?.replace(/_/g, ' ') },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search payments..." />
        </div>
        {isLoading ? <LoadingSpinner className="py-12" /> : (
          <DataTable columns={columns} data={data?.results || []} />
        )}
        {data && (
          <Pagination currentPage={page} totalPages={Math.ceil(data.count / pageSize)} pageSize={pageSize}
            totalItems={data.count} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
};

export default Payments;
