'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';

import { useGlobalSearch } from '@/features/search/hooks';
import { GlobalSearchBar } from '@/search/components/GlobalSearchBar';
import { SearchResultCard } from '@/search/components/SearchResultCard';
import { Button } from '@/components/ui/Button';

const SEARCH_SCOPES = [
  { scope: 'ALL', label: 'All Scopes' },
  { scope: 'SERVICE_REQUESTS', label: 'Service Requests' },
  { scope: 'SURVEYS', label: 'Surveys' },
  { scope: 'ESTIMATES', label: 'Estimates' },
  { scope: 'WORK_ORDERS', label: 'Work Orders' },
  { scope: 'INVOICES', label: 'Invoices' },
  { scope: 'PAYMENTS', label: 'Payments' },
];

export default function AdminSearchPage() {
  const router = useRouter();
  const { results, total, loading, filters, setFilters } = useGlobalSearch({
    query: '',
    scope: 'ALL',
    page: 1,
    pageSize: 20,
  });

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Global Search & Platform Discovery"
              description="Execute real-time cross-platform searches across service tickets, technical surveys, estimates, work orders, invoices, and payments."
            />

            {/* Global Search Bar */}
            <GlobalSearchBar
              initialValue={filters.query}
              onSearch={(q) => setFilters({ ...filters, query: q, page: 1 })}
            />

            {/* Scope Selection Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
              {SEARCH_SCOPES.map((s) => (
                <Button
                  key={s.scope}
                  variant={filters.scope === s.scope ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, scope: s.scope, page: 1 })}
                >
                  {s.label}
                </Button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {loading ? 'Searching...' : `Found ${total} matching discovery result(s)`}
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500">Executing search across platform scopes...</div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  No records match your query or selected scope.
                </div>
              ) : (
                results.map((item) => (
                  <SearchResultCard
                    key={`${item.entityType}-${item.id}`}
                    item={item}
                    onNavigate={(url) => router.push(url as any)}
                  />
                ))
              )}
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
