import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../api/public';
import { useCountdown } from '../../hooks/useCountdown';
import { StatusBadge } from '../common/StatusBadge';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { ExportButton } from '../common/ExportButton';
import { PrintButton } from '../common/PrintButton';
import { LoadingSpinner } from '../common/LoadingSpinner';

const PAGE_SIZE = 10;

const TenderCard: React.FC<{ tender: any }> = ({ tender }) => {
  const countdown = useCountdown(tender.closing_date);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            tender.type === 'rfb' ? 'bg-blue-100 text-blue-700' :
            tender.type === 'rfp' ? 'bg-purple-100 text-purple-700' :
            tender.type === 'rfq' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>{tender.type?.toUpperCase()}</span>
          <StatusBadge status={tender.status} />
        </div>
        <span className="text-xs text-gray-400">{tender.tender_number}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tender.title}</h3>
      <p className="text-sm text-gray-500 mb-1">{tender.procurement_method} • {tender.department}</p>
      <p className="text-sm text-gray-500 mb-4">{tender.procuring_entity}</p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
          countdown.expired ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
        }`}>
          {countdown.expired ? 'Closed' : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`}
        </div>
        <span className="text-sm text-gray-500">
          Closes: {new Date(tender.closing_date).toLocaleDateString('en-ZM', { dateStyle: 'long' })}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <span className="text-sm text-gray-400">Estimated Value</span>
          <p className="text-lg font-bold text-zammsa-green">{tender.currency} {tender.estimated_value?.toLocaleString()}</p>
        </div>
        <Link
          to={`/tenders/${tender.id}`}
          className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-zammsa-green-dark transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const TendersList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  const params: Record<string, any> = { page, page_size: pageSize };
  if (search) params.q = search;
  if (method) params.method = method;
  if (category) params.category = category;
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data, isLoading } = useQuery({
    queryKey: ['public-tenders', params],
    queryFn: () => publicApi.listTenders(params),
  });

  const updateSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const clearFilters = () => {
    setMethod(''); setCategory(''); setDateFrom(''); setDateTo('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenders</h1>
        <p className="text-gray-500 mt-2">Browse current procurement opportunities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={updateSearch} placeholder="Search tenders..." />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <ExportButton data={data?.results || []} filename="tenders" />
          <PrintButton />
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
              <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }} className="w-full border-gray-300 rounded-md text-sm">
                <option value="">All Methods</option>
                <option value="open_bidding">Open Bidding</option>
                <option value="limited_bidding">Limited Bidding</option>
                <option value="direct_bidding">Direct Bidding</option>
                <option value="request_for_quotation">Request for Quotation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-full border-gray-300 rounded-md text-sm">
                <option value="">All Categories</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="medical_equipment">Medical Equipment</option>
                <option value="consumables">Consumables</option>
                <option value="services">Services</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-full border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-full border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">Clear Filters</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : !data?.results?.length ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No tenders found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.results.map((tender) => (
            <TenderCard key={tender.id} tender={tender} />
          ))}
        </div>
      )}

      {data && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(data.count / pageSize)}
          pageSize={pageSize}
          totalItems={data.count}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      )}
    </div>
  );
};

export default TendersList;
