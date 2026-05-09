import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { evaluationsApi } from '../../api/evaluations';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';

const EvaluationsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['evaluation-committees', page, pageSize, search],
    queryFn: () => evaluationsApi.listCommittees({ page, page_size: pageSize, search }),
  });

  const columns = [
    { key: 'id', label: 'ID', render: (_: any, row: any) => (
      <span className="text-zammsa-green hover:underline font-medium cursor-pointer" onClick={() => navigate(`/evaluations/${row.id}`)}>{row.id?.slice(0, 8)}</span>
    )},
    { key: 'solicitation', label: 'Solicitation' },
    { key: 'member_count', label: 'Members', render: (v: number) => `${v ?? 0}` },
    { key: 'chairperson_name', label: 'Chairperson' },
    { key: 'secretary_name', label: 'Secretary' },
    { key: 'formed_date', label: 'Formed', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v || 'active'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluation Committees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage evaluation committees, COI declarations, and scoring</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search committees..." />
        </div>
        {isLoading ? <LoadingSpinner className="py-12" /> : (
          <DataTable columns={columns} data={data?.results || []} onRowClick={(row) => navigate(`/evaluations/${row.id}`)} />
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

export default EvaluationsList;
