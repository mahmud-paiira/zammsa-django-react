import React from 'react';
import { PrinterIcon } from '@heroicons/react/outline';

interface Props {
  onPrint?: () => void;
  className?: string;
}

export const PrintButton: React.FC<Props> = ({ onPrint, className = '' }) => (
  <button
    onClick={() => { onPrint?.(); window.print(); }}
    className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 ${className}`}
  >
    <PrinterIcon className="h-5 w-5" />
    Print
  </button>
);
