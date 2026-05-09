import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';

const LettersOfCredit: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['letters-of-credit', page, pageSize, search],
    queryFn: () => financeApi.listLettersOfCredit({ page, page_size: pageSize, search }),
  });

  const columns = [
    { key: 'lc_number', label: 'LC #', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'contract', label: 'Contract' },
    { key: 'issuing_bank', label: 'Bank' },
    { key: 'amount', label: 'Amount', render: (v: number) => v?.toLocaleString() },
    { key: 'expiry_date', label: 'Expiry', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Letters of Credit</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search letters of credit..." />
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

export default LettersOfCredit;
