import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { generateReport, fetchScheduledReports, generateRecurringReport } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ExportButton } from '../common/ExportButton';

const REPORT_TYPES = [
  { id: 'quarterly_procurement', label: 'Quarterly Procurement Report' },
  { id: 'direct_bidding', label: 'Direct Bidding Report' },
  { id: 'contract_amendments', label: 'Contract Amendments Report' },
  { id: 'supplier_performance', label: 'Supplier Performance Report' },
  { id: 'budget_utilization', label: 'Budget Utilization Report' },
];

const Reports: React.FC = () => {
  const [selectedType, setSelectedType] = useState(REPORT_TYPES[0].id);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ frequency: 'monthly', format: 'pdf', recipients: '' });

  const { data: scheduledData, isLoading: schedLoading } = useQuery({
    queryKey: ['scheduledReports'],
    queryFn: fetchScheduledReports,
  });

  const genMut = useMutation({
    mutationFn: () => generateReport(selectedType, dateRange),
    onSuccess: (r) => { toast.success('Report generated'); window.open(r.url, '_blank'); },
    onError: (err: any) => toast.error(err?.message || 'Generation failed'),
  });

  const genRecurringMut = useMutation({
    mutationFn: (id: string) => generateRecurringReport(id, {}),
    onSuccess: () => toast.success('Report generated'),
    onError: (err: any) => toast.error(err?.message || 'Failed'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Generate Report */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {REPORT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <div><label className="text-xs text-gray-500">Start Date</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">End Date</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div className="flex items-end gap-2">
            <button onClick={() => genMut.mutate()} disabled={genMut.isPending} className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">Generate</button>
            <ExportButton data={[]} filename={selectedType} />
          </div>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Scheduled Reports</h2>
          <button onClick={() => setShowSchedule(true)} className="px-4 py-2 bg-zammsa-orange text-white text-sm rounded-lg hover:bg-orange-600">+ Schedule Report</button>
        </div>
        {schedLoading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Name</th><th className="px-4 py-3 text-left font-medium text-gray-500">Type</th><th className="px-4 py-3 text-center font-medium text-gray-500">Frequency</th><th className="px-4 py-3 text-center font-medium text-gray-500">Format</th><th className="px-4 py-3 text-center font-medium text-gray-500">Active</th><th className="px-4 py-3 text-right font-medium text-gray-500">Last Generated</th><th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {scheduledData?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.type}</td>
                    <td className="px-4 py-3 text-center capitalize">{r.frequency}</td>
                    <td className="px-4 py-3 text-center uppercase">{r.format}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${r.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.active ? 'Yes' : 'No'}</span></td>
                    <td className="px-4 py-3 text-right text-gray-500">{r.last_generated ? new Date(r.last_generated).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => genRecurringMut.mutate(r.id)} disabled={genRecurringMut.isPending} className="text-xs text-blue-600 hover:underline">Generate Now</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generated Reports History */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Reports History</h2>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Report</th><th className="px-4 py-3 text-left font-medium text-gray-500">Type</th><th className="px-4 py-3 text-right font-medium text-gray-500">Generated At</th><th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-900">Quarterly Procurement Q1 2026</td><td className="px-4 py-3 text-gray-600">Quarterly</td><td className="px-4 py-3 text-right text-gray-500">2026-04-15</td><td className="px-4 py-3 text-center"><button className="text-xs text-blue-600 hover:underline">Download PDF</button></td></tr>
            <tr className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-900">Direct Bidding Report Mar 2026</td><td className="px-4 py-3 text-gray-600">Direct Bidding</td><td className="px-4 py-3 text-right text-gray-500">2026-04-01</td><td className="px-4 py-3 text-center"><button className="text-xs text-blue-600 hover:underline">Download PDF</button></td></tr>
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Schedule Recurring Report</h3>
            <div className="mt-4 space-y-3">
              <select value={scheduleForm.frequency} onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select>
              <select value={scheduleForm.format} onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="pdf">PDF</option><option value="excel">Excel</option><option value="csv">CSV</option></select>
              <input value={scheduleForm.recipients} onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })} placeholder="Email recipients (comma separated)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSchedule(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => { toast.success('Report scheduled'); setShowSchedule(false); }} className="px-4 py-2 text-sm font-medium text-white bg-zammsa-green rounded-lg hover:bg-green-700">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
