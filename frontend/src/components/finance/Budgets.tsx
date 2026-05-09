import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { DataTable } from '../common/DataTable';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';

const Budgets: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', page, pageSize, search],
    queryFn: () => financeApi.listBudgetAllocations({ page, page_size: pageSize, search }),
  });

  const columns = [
    { key: 'entity_code', label: 'Code', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'entity_name', label: 'Description' },
    { key: 'allocated_amount', label: 'Allocated', render: (v: number) => v?.toLocaleString() },
    { key: 'encumbered_amount', label: 'Encumbered', render: (v: number) => v?.toLocaleString() },
    { key: 'expended_amount', label: 'Spent', render: (v: number) => v?.toLocaleString() },
    { key: 'available', label: 'Remaining', render: (_: any, row: any) => {
      const pct = row.allocated_amount > 0 ? Math.round(((row.allocated_amount - row.available) / row.allocated_amount) * 100) : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-zammsa-green'}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-gray-500">{row.available?.toLocaleString()}</span>
        </div>
      );
    }},
    { key: 'fiscal_year', label: 'Fiscal Year' },
    { key: 'entity_level', label: 'Level' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search budgets..." />
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

export default Budgets;
