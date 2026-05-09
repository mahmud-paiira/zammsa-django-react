import React, { useState, useEffect } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<Props> = ({
  value, onChange, placeholder = 'Search...', debounceMs = 300,
}) => {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(timer);
  }, [local, debounceMs, onChange]);

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-72 focus:ring-zammsa-green focus:border-zammsa-green"
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChange(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
