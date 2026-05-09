import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchSystemHealth, runDiagnostics } from '../../api/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';

const MetricCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow p-5">
    <h3 className="text-sm font-medium text-gray-500 mb-3">{label}</h3>
    {children}
  </div>
);

const SystemHealth: React.FC = () => {
  const [pollInterval] = useState(30000);

  const { data, isLoading } = useQuery({
    queryKey: ['systemHealth'], queryFn: fetchSystemHealth, refetchInterval: pollInterval,
  });
  const diagMut = useMutation({
    mutationFn: runDiagnostics,
    onSuccess: (r) => toast.success(r?.message || 'Diagnostics complete'),
    onError: (err: any) => toast.error(err?.message || 'Diagnostics failed'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <button onClick={() => diagMut.mutate()} disabled={diagMut.isPending} className="px-4 py-2 bg-zammsa-green text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">Run Diagnostics</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Database */}
        <MetricCard label="Database">
          {data?.database ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Connections</span><span className="font-medium">{data.database.connections} / {data.database.max_connections}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-zammsa-green h-2 rounded-full" style={{ width: `${(data.database.connections / data.database.max_connections) * 100}%` }} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Size</span><span className="font-medium">{data.database.size}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Replication Lag</span><span className="font-medium">{data.database.replication_lag}</span></div>
            </div>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </MetricCard>

        {/* Redis */}
        <MetricCard label="Redis">
          {data?.redis ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Memory</span><span className="font-medium">{data.redis.memory_used} / {data.redis.max_memory}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hit Rate</span><span className="font-medium">{data.redis.hit_rate}%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-zammsa-green h-2 rounded-full" style={{ width: `${data.redis.hit_rate}%` }} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Clients</span><span className="font-medium">{data.redis.connected_clients}</span></div>
            </div>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </MetricCard>

        {/* Celery */}
        <MetricCard label="Celery">
          {data?.celery ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Workers</span><span className="font-medium">{data.celery.workers}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Active Tasks</span><span className="font-medium">{data.celery.active_tasks}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Queue Depth</span><span className={`font-medium ${data.celery.queue_depth > 50 ? 'text-red-600' : 'text-green-600'}`}>{data.celery.queue_depth}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Failed Tasks</span><span className={`font-medium ${data.celery.failed_tasks > 0 ? 'text-red-600' : 'text-green-600'}`}>{data.celery.failed_tasks}</span></div>
            </div>
          ) : <p className="text-gray-400 text-sm">No data</p>}
        </MetricCard>
      </div>

      {/* Server Metrics History */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Server Metrics (Last 24h)</h2>
        {data?.server ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">CPU Usage</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.server.cpu_history}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip /><Line type="monotone" dataKey="value" stroke="#008542" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Memory Usage</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.server.memory_history}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip /><Line type="monotone" dataKey="value" stroke="#EF7E1A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Disk Usage</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.server.disk_history}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip /><Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : <p className="text-gray-400 text-sm text-center py-8">No server metrics</p>}
        <p className="text-xs text-gray-400 mt-2">Uptime: {data?.server?.uptime || 'N/A'}</p>
      </div>
    </div>
  );
};

export default SystemHealth;
