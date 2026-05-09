import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import fileSaver from 'file-saver';
import toast from 'react-hot-toast';

const ContractsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('-created_at');

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', page, pageSize, search, sortKey],
    queryFn: () => contractsApi.list({ page, page_size: pageSize, search, ordering: sortKey }),
  });

  const columns = [
    { key: 'contract_number', label: 'Contract #', sortable: true, render: (_: any, row: any) => (
      <Link to={`/contracts/${row.id}`} className="text-zammsa-green hover:underline font-medium">{row.contract_number}</Link>
    )},
    { key: 'title', label: 'Title', sortable: true },
    { key: 'vendor_name', label: 'Vendor', sortable: true },
    { key: 'value', label: 'Value', render: (v: number) => v?.toLocaleString() },
    { key: 'start_date', label: 'Start', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'end_date', label: 'End', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage procurement contracts and agreements</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={async () => { try { const blob = await contractsApi.export({ search }); fileSaver.saveAs(blob, 'contracts_export.xlsx'); toast.success('Exported'); } catch { toast.error('Export failed'); }}} className="text-sm bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50">Export</button>
          <Link to="/contracts/create" className="bg-zammsa-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zammsa-green-dark">+ New Contract</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search contracts..." />
        </div>
        {isLoading ? <LoadingSpinner className="py-12" /> : (
          <DataTable columns={columns} data={data?.results || []} sortKey={sortKey.replace('-', '')}
            sortDir={sortKey.startsWith('-') ? 'desc' : 'asc'}
            onSort={(key) => setSortKey(sortKey === key ? `-${key}` : key)}
            onRowClick={(row) => navigate(`/contracts/${row.id}`)}
          />
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

export default ContractsList;
