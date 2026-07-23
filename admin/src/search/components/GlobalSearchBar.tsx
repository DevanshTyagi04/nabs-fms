'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';

export interface GlobalSearchBarProps {
  initialValue?: string;
  onSearch: (q: string) => void;
  placeholder?: string;
}

export function GlobalSearchBar({ initialValue = '', onSearch, placeholder = 'Search across tickets, invoices, work orders, payments...' }: GlobalSearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="w-full">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
