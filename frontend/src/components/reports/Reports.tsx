import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import fileSaver from 'file-saver';

const reportTypes = [
  { id: 'quarterly', label: 'Quarterly Report', params: ['year', 'quarter'] },
  { id: 'direct_bidding', label: 'Direct Bidding Report', params: [] },
  { id: 'amendments', label: 'Amendments Report', params: [] },
];

const Reports: React.FC = () => {
  const [selectedType, setSelectedType] = useState(reportTypes[0].id);
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  const { data: scheduled, isLoading: loadingScheduled } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => reportsApi.listScheduled(),
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      let blob;
      if (selectedType === 'quarterly') {
        blob = await reportsApi.getQuarterlyReport({ year, quarter });
      } else if (selectedType === 'direct_bidding') {
        blob = await reportsApi.getDirectBiddingReport();
      } else if (selectedType === 'amendments') {
        blob = await reportsApi.getAmendmentsReport();
      }
      return blob;
    },
    onSuccess: (blob: any) => {
      fileSaver.saveAs(blob, `${selectedType}_report.pdf`);
      toast.success('Report downloaded');
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: any) => reportsApi.scheduleReport(data),
    onSuccess: () => toast.success('Report scheduled'),
  });

  const [scheduleForm, setScheduleForm] = useState({ schedule: 'monthly', recipients: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage procurement reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {reportTypes.map((rt) => (
                    <button key={rt.id} onClick={() => setSelectedType(rt.id)}
                      className={`p-3 rounded-lg border text-sm text-left transition-colors ${selectedType === rt.id ? 'border-zammsa-green bg-green-50 text-zammsa-green font-medium' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedType === 'quarterly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                    <select value={quarter} onChange={(e) => setQuarter(parseInt(e.target.value))} className="w-full border-gray-300 rounded-lg px-3 py-2">
                      <option value={1}>Q1 (Jan-Mar)</option>
                      <option value={2}>Q2 (Apr-Jun)</option>
                      <option value={3}>Q3 (Jul-Sep)</option>
                      <option value={4}>Q4 (Oct-Dec)</option>
                    </select>
                  </div>
                </div>
              )}

              <button onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}
                className="px-6 py-2 bg-zammsa-green text-white rounded-lg text-sm font-medium hover:bg-zammsa-green-dark disabled:opacity-50">
                {downloadMutation.isPending ? 'Generating...' : 'Download Report'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Report</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2">
                    {reportTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={scheduleForm.schedule} onChange={(e) => setScheduleForm({ ...scheduleForm, schedule: e.target.value })} className="w-full border-gray-300 rounded-lg px-3 py-2">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated emails)</label>
                <input type="text" value={scheduleForm.recipients} onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })} placeholder="user@example.com, other@example.com" className="w-full border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <button onClick={() => {
                if (!scheduleForm.recipients) { toast.error('Enter at least one recipient'); return; }
                scheduleMutation.mutate({ report_type: selectedType, schedule: scheduleForm.schedule, recipients: scheduleForm.recipients.split(',').map((s: string) => s.trim()) });
              }} disabled={scheduleMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Report'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h2>
            {loadingScheduled ? <LoadingSpinner /> : !scheduled?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">No scheduled reports</p>
            ) : (
              <div className="space-y-3">
                {scheduled.map((s: any) => (
                  <div key={s.id} className="text-sm p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-gray-500 text-xs">Type: {s.type} | Frequency: {s.frequency}</p>
                    <p className="text-gray-400 text-xs">Next: {s.next_generation ? new Date(s.next_generation).toLocaleDateString() : '-'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>
            <Link to="/dashboard" className="text-zammsa-green hover:underline text-sm">View Dashboard →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
