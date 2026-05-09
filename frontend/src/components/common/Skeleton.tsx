import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <Skeleton className="h-4 w-1/3 mb-4" />
    <TextSkeleton lines={2} />
    <Skeleton className="h-8 w-24 mt-4" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`}>
    <div className="border-b px-6 py-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className={`px-6 py-4 ${r !== rows - 1 ? 'border-b' : ''}`}>
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <Skeleton className="h-4 w-1/4 mb-6" />
    <Skeleton className="h-48 w-full" />
  </div>
);

export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <Skeleton className="h-3 w-1/2 mb-3" />
    <Skeleton className="h-8 w-1/3 mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <TableSkeleton />
  </div>
);
