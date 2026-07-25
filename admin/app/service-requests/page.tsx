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
import { PriorityBadge } from '@/components/ui/priority-badge';
import { serviceRequestsApi, ServiceRequestQueryParams } from '@/lib/service-requests-api';
import { ServiceRequestListItem } from '@/lib/types/dashboard.types';
import { ArrowUpDown, ChevronRight, Download, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'SURVEY_PENDING', label: 'Survey Pending' },
  { value: 'SURVEY_SUBMITTED', label: 'Survey Submitted' },
  { value: 'SURVEY_APPROVED', label: 'Survey Approved' },
  { value: 'ESTIMATE_CREATED', label: 'Estimate Created' },
  { value: 'AWAITING_APPROVAL', label: 'Awaiting Approval' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WORK_COMPLETED', label: 'Work Completed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'URGENT', label: 'Urgent / Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function ServiceRequestsContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state synchronization
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialLimit = Number(searchParams.get('limit')) || 10;
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialPriority = searchParams.get('priority') || 'ALL';
  const initialSortBy = searchParams.get('sortBy') || 'createdAt';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [search, setSearch] = useState<string>(initialSearch);
  const [status, setStatus] = useState<string>(initialStatus);
  const [priority, setPriority] = useState<string>(initialPriority);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Sync state to URL query params
  const updateUrlParams = useCallback(
    (newParams: Partial<ServiceRequestQueryParams>) => {
      const params = new URLSearchParams(searchParams.toString());

      const updated = {
        page: newParams.page ?? meta.page,
        limit: newParams.limit ?? meta.limit,
        search: newParams.search ?? search,
        status: newParams.status ?? status,
        priority: newParams.priority ?? priority,
        sortBy: newParams.sortBy ?? sortBy,
        sortOrder: newParams.sortOrder ?? sortOrder,
      };

      if (updated.page && updated.page > 1) params.set('page', String(updated.page));
      else params.delete('page');

      if (updated.limit && updated.limit !== 10) params.set('limit', String(updated.limit));
      else params.delete('limit');

      if (updated.search) params.set('search', updated.search);
      else params.delete('search');

      if (updated.status && updated.status !== 'ALL') params.set('status', updated.status);
      else params.delete('status');

      if (updated.priority && updated.priority !== 'ALL') params.set('priority', updated.priority);
      else params.delete('priority');

      if (updated.sortBy && updated.sortBy !== 'createdAt') params.set('sortBy', updated.sortBy);
      else params.delete('sortBy');

      if (updated.sortOrder && updated.sortOrder !== 'desc') params.set('sortOrder', updated.sortOrder);
      else params.delete('sortOrder');

      router.replace(`/service-requests?${params.toString()}`);
    },
    [searchParams, meta.page, meta.limit, search, status, priority, sortBy, sortOrder, router]
  );

  // Fetch Service Requests
  const fetchServiceRequests = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await serviceRequestsApi.getAllRequests({
        page: meta.page,
        limit: meta.limit,
        search,
        status,
        priority,
        sortBy,
        sortOrder,
      });

      setRequests(result.data || []);
      if (result.meta) {
        setMeta((prev) => ({
          ...prev,
          total: result.meta?.totalItems ?? result.meta?.total ?? result.data.length,
          totalPages: result.meta?.totalPages ?? 1,
        }));
      } else {
        setMeta((prev) => ({
          ...prev,
          total: result.data.length,
          totalPages: Math.max(1, Math.ceil(result.data.length / prev.limit)),
        }));
      }
    } catch (err: unknown) {
      setIsError(true);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch platform service requests');
    } finally {
      setIsLoading(false);
    }
  }, [meta.page, meta.limit, search, status, priority, sortBy, sortOrder]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await serviceRequestsApi.getAllRequests({
          page: meta.page,
          limit: meta.limit,
          search,
          status,
          priority,
          sortBy,
          sortOrder,
        });
        if (isMounted) {
          setRequests(result.data || []);
          if (result.meta) {
            setMeta((prev) => ({
              ...prev,
              total: result.meta?.totalItems ?? result.meta?.total ?? result.data.length,
              totalPages: result.meta?.totalPages ?? 1,
            }));
          } else {
            setMeta((prev) => ({
              ...prev,
              total: result.data.length,
              totalPages: Math.max(1, Math.ceil(result.data.length / prev.limit)),
            }));
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch platform service requests');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [meta.page, meta.limit, search, status, priority, sortBy, sortOrder]);

  // Handler: Change search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setMeta((prev) => ({ ...prev, page: 1 }));
    updateUrlParams({ search: val, page: 1 });
  };

  // Handler: Change Filter
  const handleFilterChange = (filterId: string, val: string) => {
    if (filterId === 'status') {
      setStatus(val);
      setMeta((prev) => ({ ...prev, page: 1 }));
      updateUrlParams({ status: val, page: 1 });
    } else if (filterId === 'priority') {
      setPriority(val);
      setMeta((prev) => ({ ...prev, page: 1 }));
      updateUrlParams({ priority: val, page: 1 });
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setMeta((prev) => ({ ...prev, page: 1 }));
    router.replace('/service-requests');
  };

  // Handler: Sorting toggle
  const handleSortToggle = (field: string) => {
    let newOrder: 'asc' | 'desc' = 'desc';
    if (sortBy === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortBy(field);
    setSortOrder(newOrder);
    updateUrlParams({ sortBy: field, sortOrder: newOrder });
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    if (!requests || requests.length === 0) return;
    const headers = ['Ticket Number', 'Customer', 'Category', 'Priority', 'Status', 'Vendor', 'Created Date'];
    const rows = requests.map((r) => [
      r.ticketNumber,
      r.customer?.companyName || `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}`.trim() || 'N/A',
      r.serviceCategory?.name || 'N/A',
      r.priority,
      r.status,
      r.assignedVendor?.businessName || 'Unassigned',
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `service_requests_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const hasActiveFilters = search !== '' || status !== 'ALL' || priority !== 'ALL';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopHeader />
      <div className="flex min-h-screen pt-14">
        <Sidebar />

        <main className="lg:ml-60 flex-1 p-4 md:p-6 bg-[#F8FAFC] max-w-7xl mx-auto w-full">
          {/* Breadcrumbs & Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <nav className="flex items-center gap-1.5 text-[11px] font-mono text-[#76777d] uppercase tracking-wider mb-2">
                <span>Operations</span>
                <ChevronRight className="w-3 h-3 text-[#c6c6cd]" />
                <span className="text-[#0b1c30] font-bold">Service Requests</span>
              </nav>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Service Requests</h1>
              <p className="text-xs text-[#45464d] mt-1">
                Manage and monitor all incoming service dispatches across technical categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchServiceRequests}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c6c6cd] text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportCsv}
                disabled={requests.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006591] text-white text-xs font-semibold rounded-lg hover:bg-[#005073] transition-colors shadow-sm active:scale-95 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search Ticket, Customer, Description..."
            filters={[
              { id: 'status', label: 'Status', options: STATUS_OPTIONS, value: status },
              { id: 'priority', label: 'Priority', options: PRIORITY_OPTIONS, value: priority },
            ]}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Data Table Container */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm overflow-hidden flex flex-col">
            {isLoading ? (
              <TableLoadingState rows={6} cols={7} />
            ) : isError ? (
              <TableErrorState message={errorMsg} onRetry={fetchServiceRequests} />
            ) : requests.length === 0 ? (
              <TableEmptyState
                title="No service requests available"
                description={
                  hasActiveFilters
                    ? 'No service requests matched your filter query. Try clearing your filters.'
                    : 'There are currently no service requests recorded on the platform.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#c6c6cd] text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                      <th className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]" onClick={() => handleSortToggle('ticketNumber')}>
                        <div className="flex items-center gap-1">
                          <span>Ticket ID</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]" onClick={() => handleSortToggle('priority')}>
                        <div className="flex items-center gap-1">
                          <span>Priority</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]" onClick={() => handleSortToggle('status')}>
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]" onClick={() => handleSortToggle('createdAt')}>
                        <div className="flex items-center gap-1">
                          <span>Created</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c6c6cd]">
                    {requests.map((r) => {
                      const customerName =
                        r.customer?.companyName ||
                        `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}`.trim() ||
                        'Unknown Customer';
                      const customerEmail = r.customer?.user?.email || '';
                      const categoryName = r.serviceCategory?.name || 'General';
                      const vendorName = r.assignedVendor?.businessName || 'Unassigned';
                      const createdDate = new Date(r.createdAt).toISOString().split('T')[0];

                      return (
                        <tr key={r.id} className="hover:bg-[#eff4ff]/60 transition-colors text-xs">
                          <td className="px-4 py-3 font-mono font-bold text-[#006591] whitespace-nowrap">
                            <Link href={`/service-requests/${r.id}`} className="hover:underline">
                              {r.ticketNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#0b1c30]">{customerName}</span>
                              {customerEmail && (
                                <span className="text-[10px] text-[#76777d]">{customerEmail}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[#45464d] font-bold text-[10px] uppercase">
                              {categoryName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={r.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-4 py-3 text-[#45464d] font-medium">{vendorName}</td>
                          <td className="px-4 py-3 text-[#76777d] font-mono text-[11px] whitespace-nowrap">
                            {createdDate}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/service-requests/${r.id}`}
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

            {/* Pagination Footer */}
            {!isLoading && !isError && requests.length > 0 && (
              <PaginationFooter
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                limit={meta.limit}
                onPageChange={(page) => {
                  setMeta((prev) => ({ ...prev, page }));
                  updateUrlParams({ page });
                }}
                onLimitChange={(limit) => {
                  setMeta((prev) => ({ ...prev, limit, page: 1 }));
                  updateUrlParams({ limit, page: 1 });
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ServiceRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin"></div>
        </div>
      }
    >
      <ServiceRequestsContent />
    </Suspense>
  );
}
