'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSchemaField {
  key: string;
  type: 'text' | 'select' | 'status';
  placeholder?: string;
  options?: FilterOption[];
  label?: string;
}

export interface FilterBarProps {
  fields: FilterSchemaField[];
  values: Record<string, any>;
  onChange: (newValues: Record<string, any>) => void;
  onReset?: () => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  fields,
  values,
  onChange,
  onReset,
  searchPlaceholder = 'Search records...',
}: FilterBarProps) {
  const handleChange = (key: string, val: any) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  const activeFilterCount = Object.values(values).filter(
    (v) => v !== '' && v !== undefined && v !== null && v !== 'ALL'
  ).length;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        {fields.map((field) => {
          if (field.type === 'text') {
            return (
              <div key={field.key} className="flex-1 min-w-[200px]">
                <Input
                  placeholder={field.placeholder || searchPlaceholder}
                  leftIcon="search"
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            );
          }

          if (field.type === 'select' || field.type === 'status') {
            return (
              <div key={field.key} className="min-w-[140px]">
                <select
                  value={values[field.key] || 'ALL'}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full h-9 px-3 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">{field.placeholder || `All ${field.label || field.key}`}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return null;
        })}
      </div>

      {activeFilterCount > 0 && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs shrink-0 self-end sm:self-auto">
          <Icon name="x" size="xs" className="mr-1" />
          Clear Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
