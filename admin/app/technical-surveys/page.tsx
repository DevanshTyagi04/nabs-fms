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
import { surveysApi } from '@/lib/surveys-api';
import { vendorsApi } from '@/lib/vendors-api';
import { SurveyListItem, SurveyQueryParams } from '@/lib/types/surveys.types';
import { VendorOptionItem } from '@/lib/types/service-requests.types';
import { ArrowUpDown, ChevronRight, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Survey Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUPERSEDED', label: 'Superseded' },
];

const SEVERITY_OPTIONS = [
  { value: 'ALL', label: 'Severity' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function TechnicalSurveysContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state synchronization
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialLimit = Number(searchParams.get('limit')) || 10;
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialSeverity = searchParams.get('severity') || 'ALL';
  const initialVendorId = searchParams.get('vendorId') || 'ALL';
  const initialSortBy = searchParams.get('sortBy') || 'createdAt';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [vendorOptions, setVendorOptions] = useState<{ value: string; label: string }[]>([
    { value: 'ALL', label: 'Vendor' },
  ]);
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
  const [severity, setSeverity] = useState<string>(initialSeverity);
  const [vendorId, setVendorId] = useState<string>(initialVendorId);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load Vendor options for filter
  useEffect(() => {
    let isMounted = true;
    async function loadVendors() {
      try {
        const vendorsList: VendorOptionItem[] = await vendorsApi.getVendorsList();
        if (isMounted && vendorsList && vendorsList.length > 0) {
          const formatted = [
            { value: 'ALL', label: 'Vendor' },
            ...vendorsList.map((v) => ({
              value: v.id,
              label: v.businessName,
            })),
          ];
          setVendorOptions(formatted);
        }
      } catch {
        // Fallback silently if vendor options fail
      }
    }
    loadVendors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state to URL query params
  const updateUrlParams = useCallback(
    (newParams: Partial<SurveyQueryParams>) => {
      const params = new URLSearchParams(searchParams.toString());

      const updated = {
        page: newParams.page ?? meta.page,
        limit: newParams.limit ?? meta.limit,
        search: newParams.search ?? search,
        status: newParams.status ?? status,
        severity: newParams.severity ?? severity,
        vendorId: newParams.vendorId ?? vendorId,
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

      if (updated.severity && updated.severity !== 'ALL') params.set('severity', updated.severity);
      else params.delete('severity');

      if (updated.vendorId && updated.vendorId !== 'ALL') params.set('vendorId', updated.vendorId);
      else params.delete('vendorId');

      if (updated.sortBy && updated.sortBy !== 'createdAt') params.set('sortBy', updated.sortBy);
      else params.delete('sortBy');

      if (updated.sortOrder && updated.sortOrder !== 'desc') params.set('sortOrder', updated.sortOrder);
      else params.delete('sortOrder');

      router.replace(`/technical-surveys?${params.toString()}`);
    },
    [searchParams, meta.page, meta.limit, search, status, severity, vendorId, sortBy, sortOrder, router]
  );

  // Fetch Technical Surveys
  const fetchTechnicalSurveys = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await surveysApi.getAllSurveys({
        page: meta.page,
        limit: meta.limit,
        search,
        status,
        severity,
        vendorId,
        sortBy,
        sortOrder,
      });

      setSurveys(result.data || []);
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch technical surveys');
    } finally {
      setIsLoading(false);
    }
  }, [meta.page, meta.limit, search, status, severity, vendorId, sortBy, sortOrder]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await surveysApi.getAllSurveys({
          page: meta.page,
          limit: meta.limit,
          search,
          status,
          severity,
          vendorId,
          sortBy,
          sortOrder,
        });
        if (isMounted) {
          setSurveys(result.data || []);
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
          setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch technical surveys');
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
  }, [meta.page, meta.limit, search, status, severity, vendorId, sortBy, sortOrder]);

  // Handler: Search change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setMeta((prev) => ({ ...prev, page: 1 }));
    updateUrlParams({ search: val, page: 1 });
  };

  // Handler: Filter change
  const handleFilterChange = (filterId: string, val: string) => {
    if (filterId === 'status') {
      setStatus(val);
      setMeta((prev) => ({ ...prev, page: 1 }));
      updateUrlParams({ status: val, page: 1 });
    } else if (filterId === 'severity') {
      setSeverity(val);
      setMeta((prev) => ({ ...prev, page: 1 }));
      updateUrlParams({ severity: val, page: 1 });
    } else if (filterId === 'vendor') {
      setVendorId(val);
      setMeta((prev) => ({ ...prev, page: 1 }));
      updateUrlParams({ vendorId: val, page: 1 });
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setSeverity('ALL');
    setVendorId('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setMeta((prev) => ({ ...prev, page: 1 }));
    router.replace('/technical-surveys');
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const hasActiveFilters = search !== '' || status !== 'ALL' || severity !== 'ALL' || vendorId !== 'ALL';

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
                <span className="text-[#0b1c30] font-bold">Technical Surveys</span>
              </nav>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Technical Surveys</h1>
              <p className="text-xs text-[#45464d] mt-1">
                Manage, review and monitor all technical inspections submitted by vendors before estimate generation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTechnicalSurveys}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c6c6cd] text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by ID, request, customer, or vendor..."
            filters={[
              { id: 'status', label: 'Survey Status', options: STATUS_OPTIONS, value: status },
              { id: 'severity', label: 'Severity', options: SEVERITY_OPTIONS, value: severity },
              { id: 'vendor', label: 'Vendor', options: vendorOptions, value: vendorId },
            ]}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Data Table Container */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm overflow-hidden flex flex-col">
            {isLoading ? (
              <TableLoadingState rows={6} cols={9} />
            ) : isError ? (
              <TableErrorState message={errorMsg} onRetry={fetchTechnicalSurveys} />
            ) : surveys.length === 0 ? (
              <TableEmptyState
                title="No technical surveys found."
                description={
                  hasActiveFilters
                    ? 'No technical surveys matched your filter criteria. Try resetting your search or filters.'
                    : 'There are currently no technical surveys recorded on the platform.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#c6c6cd] text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                      <th
                        className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]"
                        onClick={() => handleSortToggle('id')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Survey ID</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th className="px-4 py-3">Service Request</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3 text-center">Version</th>
                      <th className="px-4 py-3">Highest Severity</th>
                      <th
                        className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]"
                        onClick={() => handleSortToggle('status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Survey Status</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 cursor-pointer hover:text-[#0b1c30]"
                        onClick={() => handleSortToggle('updatedAt')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Last Updated</span>
                          <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c6c6cd]">
                    {surveys.map((s) => {
                      const displaySurveyId = `TS-2026-${s.id.slice(0, 4).toUpperCase()}`;
                      const ticketNumber = s.serviceRequest?.ticketNumber || 'N/A';
                      const categoryName = s.serviceRequest?.serviceCategory?.name || 'GENERAL';
                      const requestStatus = s.serviceRequest?.status || 'CREATED';

                      const customerName =
                        s.serviceRequest?.customer?.companyName ||
                        `${s.serviceRequest?.customer?.firstName || ''} ${s.serviceRequest?.customer?.lastName || ''}`.trim() ||
                        'Unknown Customer';
                      const customerEmail = s.serviceRequest?.customer?.user?.email || '';
                      const vendorName = s.vendor?.businessName || s.vendor?.companyName || 'Unassigned';

                      const updatedDate = (s.updatedAt || s.createdAt || '').split('T')[0];
                      const targetDetailUrl = `/service-requests/${s.serviceRequestId}`;

                      return (
                        <tr key={s.id} className="hover:bg-[#eff4ff]/60 transition-colors text-xs">
                          <td className="px-4 py-3 font-mono font-bold text-[#006591] whitespace-nowrap">
                            <Link href={targetDetailUrl} className="hover:underline">
                              {displaySurveyId}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-[#0b1c30]">{ticketNumber}</span>
                              <span className="text-[10px] text-[#76777d] uppercase">{categoryName}</span>
                              <div className="mt-0.5">
                                <StatusBadge status={requestStatus} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#0b1c30]">{customerName}</span>
                              {customerEmail && (
                                <span className="text-[10px] text-[#76777d]">{customerEmail}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#45464d] font-medium">{vendorName}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[#45464d] font-bold text-[10px] uppercase">
                              V{s.version}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={s.highestSeverity || 'LOW'} variant="badge" />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={s.status} />
                          </td>
                          <td className="px-4 py-3 text-[#76777d] font-mono text-[11px] whitespace-nowrap">
                            {updatedDate}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={targetDetailUrl}
                              className="inline-flex items-center gap-1 text-[#006591] hover:underline font-bold text-[11px]"
                            >
                              Review
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
            {!isLoading && !isError && surveys.length > 0 && (
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

export default function TechnicalSurveysPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin"></div>
        </div>
      }
    >
      <TechnicalSurveysContent />
    </Suspense>
  );
}
