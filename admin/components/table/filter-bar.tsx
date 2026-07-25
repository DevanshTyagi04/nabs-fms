'use client';

import React from 'react';
import { SearchInput } from './search-input';
import { RotateCcw } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onFilterChange?: (filterId: string, value: string) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onFilterChange,
  onResetFilters,
  hasActiveFilters = false,
  children,
}: FilterBarProps) {
  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm mb-4">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full sm:w-72"
        />

        {filters.map((filter) => (
          <select
            key={filter.id}
            value={filter.value}
            onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
            className="pl-3 pr-8 py-1.5 border border-[#c6c6cd] rounded-lg text-xs bg-white text-[#0b1c30] focus:ring-1 focus:ring-[#006591] focus:outline-none cursor-pointer shadow-sm font-medium"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {children}
      </div>

      {hasActiveFilters && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs font-semibold text-[#006591] hover:underline px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
