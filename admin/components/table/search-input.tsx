'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value: externalValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 400,
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState<string>(externalValue);
  const [prevExternal, setPrevExternal] = useState<string>(externalValue);

  if (externalValue !== prevExternal) {
    setPrevExternal(externalValue);
    setInternalValue(externalValue);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== externalValue) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, externalValue, onChange, debounceMs]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={`relative min-w-[240px] ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]">
        <Search className="w-4 h-4" />
      </span>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-1.5 border border-[#c6c6cd] rounded-lg text-xs text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#006591] bg-white transition-all shadow-sm"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#0b1c30] p-0.5"
          type="button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
