import React from 'react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  pending_dept_head: 'bg-yellow-100 text-yellow-800',
  pending_finance: 'bg-yellow-100 text-yellow-800',
  pending_dg: 'bg-yellow-100 text-yellow-800',
  pending_zpc: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  terminated: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  awarded: 'bg-purple-100 text-purple-800',
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

interface Props {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statusColors[status] || 'bg-gray-100 text-gray-800'
    } ${className}`}
  >
    {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
  </span>
);
