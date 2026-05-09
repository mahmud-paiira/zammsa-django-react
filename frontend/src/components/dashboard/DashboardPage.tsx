import React from 'react';
import { useAppSelector } from '../../hooks/useRedux';

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zammsa-green">ZAMMSA Procurement System</h1>
          <span className="text-sm text-gray-600">{user?.full_name}</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Total Procurements', 'Pending Approvals', 'Active Contracts'].map((title) => (
            <div key={title} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">{title}</h3>
              <p className="mt-2 text-3xl font-bold text-zammsa-green">--</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
