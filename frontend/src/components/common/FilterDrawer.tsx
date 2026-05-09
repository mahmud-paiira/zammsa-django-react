import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { SearchBar } from './SearchBar';
import { ExportButton } from './ExportButton';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
  value: any;
  onChange: (value: any) => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  filters: FilterOption[];
  onApply: () => void;
  onClear: () => void;
  exportData?: Record<string, any>[];
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export const FilterDrawer: React.FC<Props> = ({
  open, onClose, filters, onApply, onClear, exportData, searchValue, onSearchChange,
}) => (
  <Transition show={open} as={Fragment}>
    <div className="fixed inset-0 z-40 overflow-hidden">
      <Transition.Child as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
      </Transition.Child>
      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-xl">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-medium">Filters</h2>
            <button onClick={onClose}><XIcon className="h-6 w-6 text-gray-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {onSearchChange && <SearchBar value={searchValue || ''} onChange={onSearchChange} />}
            {filters.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full border-gray-300 rounded-md">
                    <option value="">All</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'date' ? (
                  <input type="date" value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full border-gray-300 rounded-md" />
                ) : (
                  <input type="text" value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full border-gray-300 rounded-md" />
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={onApply} className="px-4 py-2 bg-zammsa-green text-white rounded-lg text-sm hover:bg-zammsa-green-dark">Apply</button>
              <button onClick={onClear} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Clear</button>
            </div>
            {exportData && <ExportButton data={exportData} />}
          </div>
        </div>
      </div>
    </div>
  </Transition>
);
