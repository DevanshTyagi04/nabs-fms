'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { TopHeader } from '@/components/dashboard/top-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { FilterBar } from '@/components/table/filter-bar';
import { PaginationFooter } from '@/components/table/pagination-footer';
import { TableLoadingState } from '@/components/table/table-loading-state';
import { TableEmptyState } from '@/components/table/table-empty-state';
import { TableErrorState } from '@/components/table/table-error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { vendorsApi } from '@/lib/vendors-api';
import { VendorOptionItem } from '@/lib/types/service-requests.types';
import { EstimateQueryParams, EstimateSortField } from '@/lib/types/estimates.types';
import { useEstimatesList } from '@/hooks/use-estimates-list';
import { ArrowUpDown, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';

// ── Status filter options (all 6 backend statuses) ──────────────────────────
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Estimate Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REVISED', label: 'Revised' },
  { value: 'SUPERSEDED', label: 'Superseded' },
];

// ── Whitelisted sortable columns (prevents Prisma runtime errors) ────────────
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'version', label: 'Version' },
  { value: 'updatedAt', label: 'Last Updated' },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format Prisma Decimal (serialised as string) into INR currency display */
function formatAmount(val: string | number | undefined | null): string {
  const n = typeof val === 'number' ? val : parseFloat(String(val ?? '0'));
  if (isNaN(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Returns true if validUntil is a past date */
function isExpired(validUntil: string | null | undefined): boolean {
  if (!validUntil) return false;
  return new Date(validUntil) < new Date();
}

/** Format ISO date to readable date string */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return iso.split('T')[0];
}

// ── Main Page Content ────────────────────────────────────────────────────────

function EstimatesContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL state sync ─────────────────────────────────────────────────────────
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialLimit = Number(searchParams.get('limit')) || 10;
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialVendorId = searchParams.get('vendorId') || 'ALL';
  const initialSortBy = (searchParams.get('sortBy') as EstimateSortField) || 'createdAt';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  // ── Local state ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [vendorId, setVendorId] = useState(initialVendorId);
  const [sortBy, setSortBy] = useState<EstimateSortField>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const [vendorOptions, setVendorOptions] = useState<{ value: string; label: string }[]>([
    { value: 'ALL', label: 'Vendor' },
  ]);

  // ── Build query params for hook ────────────────────────────────────────────
  const queryParams: EstimateQueryParams = {
    page,
    limit,
    search: search || undefined,
    status: status !== 'ALL' ? (status as EstimateQueryParams['status']) : undefined,
    vendorId: vendorId !== 'ALL' ? vendorId : undefined,
    sortBy,
    sortOrder,
  };

  const { estimates, meta, isLoading, isError, errorMsg, refetch } = useEstimatesList(queryParams);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // ── Load vendor options for filter dropdown ────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadVendors() {
      try {
        const vendorsList: VendorOptionItem[] = await vendorsApi.getVendorsList();
        if (isMounted && vendorsList.length > 0) {
          setVendorOptions([
            { value: 'ALL', label: 'Vendor' },
            ...vendorsList.map((v) => ({ value: v.id, label: v.businessName })),
          ]);
        }
      } catch {
        // Fail silently — vendor filter just stays as "ALL"
      }
    }
    loadVendors();
    return () => { isMounted = false; };
  }, []);

  // ── URL sync helper ────────────────────────────────────────────────────────
  const updateUrlParams = useCallback(
    (newParams: Partial<EstimateQueryParams & { page: number; limit: number }>) => {
      const params = new URLSearchParams(searchParams.toString());

      const resolved = {
        page: newParams.page ?? page,
        limit: newParams.limit ?? limit,
        search: newParams.search !== undefined ? newParams.search : search,
        status: newParams.status !== undefined ? newParams.status : status,
        vendorId: newParams.vendorId !== undefined ? newParams.vendorId : vendorId,
        sortBy: newParams.sortBy ?? sortBy,
        sortOrder: newParams.sortOrder ?? sortOrder,
      };

      if (resolved.page > 1) params.set('page', String(resolved.page));
      else params.delete('page');

      if (resolved.limit !== 10) params.set('limit', String(resolved.limit));
      else params.delete('limit');

      if (resolved.search) params.set('search', resolved.search);
      else params.delete('search');

      if (resolved.status && resolved.status !== 'ALL') params.set('status', String(resolved.status));
      else params.delete('status');

      if (resolved.vendorId && resolved.vendorId !== 'ALL') params.set('vendorId', resolved.vendorId);
      else params.delete('vendorId');

      if (resolved.sortBy && resolved.sortBy !== 'createdAt') params.set('sortBy', resolved.sortBy);
      else params.delete('sortBy');

      if (resolved.sortOrder && resolved.sortOrder !== 'desc') params.set('sortOrder', resolved.sortOrder);
      else params.delete('sortOrder');

      router.replace(`/estimates?${params.toString()}`);
    },
    [searchParams, page, limit, search, status, vendorId, sortBy, sortOrder, router],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    updateUrlParams({ search: val, page: 1 });
  };

  const handleFilterChange = (filterId: string, val: string) => {
    if (filterId === 'status') {
      setStatus(val);
      setPage(1);
      updateUrlParams({ status: val as EstimateQueryParams['status'], page: 1 });
    } else if (filterId === 'vendor') {
      setVendorId(val);
      setPage(1);
      updateUrlParams({ vendorId: val, page: 1 });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setVendorId('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    router.replace('/estimates');
  };

  const handleSortToggle = (field: EstimateSortField) => {
    const newOrder: 'asc' | 'desc' = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    updateUrlParams({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams({ limit: newLimit, page: 1 });
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const hasActiveFilters = search !== '' || status !== 'ALL' || vendorId !== 'ALL';

  const SortHeader = ({
    field,
    children,
    className = '',
  }: {
    field: EstimateSortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      className={`px-4 py-3 cursor-pointer hover:text-[#0b1c30] ${className}`}
      onClick={() => handleSortToggle(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <ArrowUpDown
          className={`w-3 h-3 ${sortBy === field ? 'text-[#006591]' : 'text-[#76777d]'}`}
        />
      </div>
    </th>
  );

  // ── Auth loading ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopHeader />
      <div className="flex min-h-screen pt-14">
        <Sidebar />

        <main className="lg:ml-60 flex-1 p-4 md:p-6 bg-[#F8FAFC] max-w-7xl mx-auto w-full">

          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <nav className="flex items-center gap-1.5 text-[11px] font-mono text-[#76777d] uppercase tracking-wider mb-2">
                <span>Operations</span>
                <ChevronRight className="w-3 h-3 text-[#c6c6cd]" />
                <span className="text-[#0b1c30] font-bold">Estimates</span>
              </nav>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Estimates</h1>
              <p className="text-xs text-[#45464d] mt-1">
                Manage, monitor and review all estimates created for approved service requests.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c6c6cd] text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <FilterBar
            searchValue={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by Ticket Number or Item Description..."
            filters={[
              { id: 'status', label: 'Estimate Status', options: STATUS_OPTIONS, value: status },
              { id: 'vendor', label: 'Vendor', options: vendorOptions, value: vendorId },
            ]}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          >
            {/* Sort selector rendered as additional filter-bar child */}
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(':') as [EstimateSortField, 'asc' | 'desc'];
                setSortBy(field);
                setSortOrder(order);
                updateUrlParams({ sortBy: field, sortOrder: order });
              }}
              className="pl-3 pr-8 py-1.5 border border-[#c6c6cd] rounded-lg text-xs bg-white text-[#0b1c30] focus:ring-1 focus:ring-[#006591] focus:outline-none cursor-pointer shadow-sm font-medium"
            >
              {SORT_OPTIONS.flatMap((opt) => [
                <option key={`${opt.value}:desc`} value={`${opt.value}:desc`}>
                  {opt.label} ↓
                </option>,
                <option key={`${opt.value}:asc`} value={`${opt.value}:asc`}>
                  {opt.label} ↑
                </option>,
              ])}
            </select>
          </FilterBar>

          {/* ── Data Table ── */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm overflow-hidden flex flex-col">
            {isLoading ? (
              <TableLoadingState rows={7} cols={10} />
            ) : isError ? (
              <TableErrorState message={errorMsg} onRetry={refetch} />
            ) : estimates.length === 0 ? (
              <TableEmptyState
                title="No estimates found."
                description={
                  hasActiveFilters
                    ? 'No estimates matched your filter criteria. Try resetting your search or filters.'
                    : 'There are currently no estimates recorded on the platform.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#c6c6cd] text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                      <th className="px-4 py-3">Estimate ID</th>
                      <th className="px-4 py-3 text-center">Ver.</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Service Request</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Vendor</th>
                      <SortHeader field="totalAmount" className="text-right">
                        Total Amount
                      </SortHeader>
                      <th className="px-4 py-3">Valid Until</th>
                      <th className="px-4 py-3 text-center">Items</th>
                      <SortHeader field="createdAt">Created</SortHeader>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c6c6cd]">
                    {estimates.map((est) => {
                      const displayId = `EST-${est.id.slice(0, 6).toUpperCase()}`;
                      const ticketNumber = est.serviceRequest?.ticketNumber || 'N/A';
                      const srTitle = est.serviceRequest?.title || '—';
                      const customerName =
                        `${est.serviceRequest?.customer?.firstName || ''} ${est.serviceRequest?.customer?.lastName || ''}`.trim() ||
                        'Unknown';
                      const vendorName = est.serviceRequest?.assignedVendor?.businessName || 'Unassigned';
                      const expired = isExpired(est.validUntil);
                      const detailUrl = `/estimates/${est.id}`;

                      return (
                        <tr
                          key={est.id}
                          className="hover:bg-[#eff4ff]/60 transition-colors text-xs cursor-pointer"
                          onClick={() => router.push(detailUrl)}
                        >
                          {/* Estimate ID */}
                          <td className="px-4 py-3 font-mono font-bold text-[#006591] whitespace-nowrap">
                            <Link
                              href={detailUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline"
                            >
                              {displayId}
                            </Link>
                          </td>

                          {/* Version */}
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[#45464d] font-bold text-[10px] uppercase">
                              v{est.version}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={est.status} />
                          </td>

                          {/* Service Request */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[#0b1c30]">{ticketNumber}</span>
                              <span
                                className="text-[10px] text-[#76777d] max-w-[160px] truncate"
                                title={srTitle}
                              >
                                {srTitle}
                              </span>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3 text-[#45464d] font-medium">
                            {customerName}
                          </td>

                          {/* Vendor */}
                          <td className="px-4 py-3 text-[#45464d] font-medium">
                            {vendorName}
                          </td>

                          {/* Total Amount */}
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#0b1c30] whitespace-nowrap">
                            {formatAmount(est.totalAmount)}
                          </td>

                          {/* Valid Until */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {est.validUntil ? (
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`font-mono text-[11px] ${
                                    expired ? 'text-red-600 font-bold' : 'text-[#45464d]'
                                  }`}
                                >
                                  {formatDate(est.validUntil)}
                                </span>
                                {expired && (
                                  <div className="flex items-center gap-0.5 text-red-600">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    <span className="text-[10px] font-bold uppercase">Expired</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#76777d] italic text-[11px]">No expiry</span>
                            )}
                          </td>

                          {/* Item Count */}
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-[#006591]/10 text-[#006591] font-bold text-[10px]">
                              {est._count?.items ?? 0}
                            </span>
                          </td>

                          {/* Created At */}
                          <td className="px-4 py-3 text-[#76777d] font-mono text-[11px] whitespace-nowrap">
                            {formatDate(est.createdAt)}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={detailUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[#006591] hover:underline font-bold text-[11px]"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination ── */}
            {!isLoading && !isError && estimates.length > 0 && (
              <PaginationFooter
                currentPage={page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Suspense wrapper (required for useSearchParams) ───────────────────────────
export default function EstimatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin" />
        </div>
      }
    >
      <EstimatesContent />
    </Suspense>
  );
}
