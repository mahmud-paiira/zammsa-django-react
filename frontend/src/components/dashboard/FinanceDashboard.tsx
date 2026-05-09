import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchFinanceDashboard } from '../../api/dashboards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ExportButton } from '../common/ExportButton';
import { useAppSelector } from '../../hooks/useRedux';

const FinanceDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [pollInterval] = useState(30000);

  const { data, isLoading } = useQuery({
    queryKey: ['financeDashboard'],
    queryFn: fetchFinanceDashboard,
    refetchInterval: pollInterval,
  });

  if (isLoading) return <LoadingSpinner />;

  const progressColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-yellow-500';
    return 'bg-zammsa-green';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={data?.budget_utilization || data?.pending_invoices || []} filename="finance-dashboard" />
          <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">Auto-refreshing every 30s</span>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-green">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">ZMW {data?.total_budget?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-zammsa-orange">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">ZMW {data?.total_spent?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className="text-2xl font-bold text-gray-900">ZMW {data?.total_remaining?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      {/* Budget Utilization */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h2>
        {data?.budget_utilization && data.budget_utilization.length > 0 ? (
          <div className="space-y-4">
            {data.budget_utilization.map((b) => (
              <div key={b.code}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{b.code} - {b.description}</span>
                  <span className="text-gray-500">{b.percentage.toFixed(1)}% ({b.allocated.toLocaleString()})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${progressColor(b.percentage)}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Spent: ZMW {b.spent.toLocaleString()}</span>
                  <span>Remaining: ZMW {b.remaining.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No budget data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Invoices */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Invoices</h2>
          {data?.pending_invoices && data.pending_invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Invoice</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Vendor</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">Amount</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.pending_invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{inv.invoice_number}</td>
                      <td className="px-3 py-2 text-gray-600">{inv.vendor}</td>
                      <td className="px-3 py-2 text-right">ZMW {inv.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          inv.days_overdue > 30 ? 'bg-red-100 text-red-700' :
                          inv.days_overdue > 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{inv.days_overdue}d</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No pending invoices</p>
          )}
        </div>

        {/* Payment Queue */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Queue</h2>
          {data?.payment_queue && data.payment_queue.length > 0 ? (
            <div className="space-y-3">
              {data.payment_queue.map((pq) => (
                <div key={pq.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pq.invoice}</p>
                    <p className="text-xs text-gray-500">{new Date(pq.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">ZMW {pq.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      pq.priority === 'high' ? 'bg-red-100 text-red-700' :
                      pq.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>{pq.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No payments queued</p>
          )}
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Budget Breakdown</h2>
        {data?.department_breakdown && data.department_breakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.department_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="allocated" name="Allocated" fill="#008542" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#EF7E1A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No department data</p>
        )}
      </div>

      {/* Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Budget Alerts</h2>
          <div className="space-y-2">
            {data.alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${a.type === 'warning' ? 'bg-yellow-500' : a.type === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`} />
                <span className="text-gray-700">{a.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;
