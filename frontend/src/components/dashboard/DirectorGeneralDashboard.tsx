import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchDGDashboard } from '../../api/dashboards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ExportButton } from '../common/ExportButton';
import { useAppSelector } from '../../hooks/useRedux';

const PIE_COLORS = ['#008542', '#EF7E1A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

const DirectorGeneralDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [pollInterval] = useState(30000);

  const { data, isLoading } = useQuery({
    queryKey: ['dgDashboard'],
    queryFn: fetchDGDashboard,
    refetchInterval: pollInterval,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Director General Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={data?.procurement_by_method || data?.procurement_by_department || data?.top_suppliers || []} filename="executive-summary" />
          <button className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
            Export Executive Summary (PDF)
          </button>
          <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.executive_kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value.toLocaleString()}</p>
            <span className={`text-xs ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}%
            </span>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-green">
          <p className="text-sm text-gray-500">Total Procurement Value</p>
          <p className="text-2xl font-bold text-gray-900">ZMW {data?.total_procurement_value?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{data?.active_contracts ?? 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-zammsa-orange">{data?.pending_approvals_count ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procurement by Method */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Procurement by Method</h2>
          {data?.procurement_by_method && data.procurement_by_method.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.procurement_by_method} dataKey="value" nameKey="method" cx="50%" cy="50%" outerRadius={100} label={({ method, value }) => `${method} (${value})`}>
                  {data.procurement_by_method.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data</p>}
        </div>

        {/* Procurement by Department */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Procurement by Department</h2>
          {data?.procurement_by_department && data.procurement_by_department.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.procurement_by_department} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="department" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#008542" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data</p>}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Procurement Trend</h2>
        {data?.monthly_trend && data.monthly_trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" name="Procurements" stroke="#008542" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="value" name="Value (ZMW)" stroke="#EF7E1A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-400 text-sm text-center py-8">No data</p>}
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Suppliers by Contract Value</h2>
        {data?.top_suppliers && data.top_suppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Contract Value</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Contracts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.top_suppliers.map((s, i) => (
                  <tr key={s.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-right">ZMW {s.contract_value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">{s.contracts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No supplier data</p>}
      </div>

      {/* Pending Approvals Widget */}
      <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-orange">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <span className="bg-zammsa-orange text-white text-sm font-bold px-3 py-1 rounded-full">{data?.pending_approvals_count ?? 0}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">Items awaiting your approval in the queue</p>
      </div>
    </div>
  );
};

export default DirectorGeneralDashboard;
