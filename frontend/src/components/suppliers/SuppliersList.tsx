import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../../api/suppliers';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import fileSaver from 'file-saver';
import toast from 'react-hot-toast';

const SuppliersList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, pageSize, search],
    queryFn: () => suppliersApi.list({ page, page_size: pageSize, search }),
  });

  const riskColors: Record<string, string> = { low: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50', high: 'text-red-600 bg-red-50' };

  const columns = [
    { key: 'company_name', label: 'Company', sortable: true, render: (_: any, row: any) => (
      <Link to={`/suppliers/${row.id}`} className="text-zammsa-green hover:underline font-medium">{row.company_name}</Link>
    )},
    { key: 'registration_number', label: 'Reg #' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'business_type', label: 'Type' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'risk_score', label: 'Risk', render: (_: any, row: any) => {
      const level = row.risk_score <= 30 ? 'low' : row.risk_score <= 60 ? 'medium' : 'high';
      return <span className={`text-xs font-medium px-2 py-1 rounded-full ${riskColors[level]}`}>{level.toUpperCase()} ({row.risk_score})</span>;
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered suppliers and vendors</p>
        </div>
        <button onClick={async () => { try { const blob = await suppliersApi.export({ search }); fileSaver.saveAs(blob, 'suppliers_export.xlsx'); toast.success('Exported'); } catch { toast.error('Export failed'); }}} className="text-sm bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50">Export</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search suppliers..." />
        </div>
        {isLoading ? <LoadingSpinner className="py-12" /> : (
          <DataTable columns={columns} data={data?.results || []} onRowClick={(row) => navigate(`/suppliers/${row.id}`)} />
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

export default SuppliersList;
