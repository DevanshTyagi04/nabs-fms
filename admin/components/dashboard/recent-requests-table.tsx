'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { ServiceRequestListItem } from '@/lib/types/dashboard.types';

interface RecentRequestsTableProps {
  refreshTrigger?: number;
}

export function RecentRequestsTable({ refreshTrigger }: RecentRequestsTableProps) {
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await dashboardApi.getRecentServiceRequests(5);
      setRequests(response.data || []);
    } catch (err: unknown) {
      setIsError(true);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch recent service requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await dashboardApi.getRecentServiceRequests(5);
        if (isMounted) {
          setRequests(response.data || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch recent service requests');
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
  }, [refreshTrigger]);

  const handleExportCsv = () => {
    if (!requests || requests.length === 0) return;
    const headers = ['Ticket Number', 'Customer', 'Priority', 'Status', 'Vendor', 'Created Date'];
    const rows = requests.map((r) => [
      r.ticketNumber,
      r.customer?.companyName || `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}`.trim() || 'N/A',
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
    link.setAttribute('download', `recent_service_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 uppercase">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 uppercase">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 uppercase">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'WORK_COMPLETED':
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">COMPLETED</span>;
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200">ASSIGNED</span>;
      case 'CREATED':
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">CREATED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-lg overflow-hidden flex flex-col shadow-sm">
      <div className="px-5 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
        <h2 className="text-[14px] font-bold text-[#0b1c30]">Recent Service Requests</h2>
        <button
          onClick={handleExportCsv}
          disabled={requests.length === 0}
          className="flex items-center gap-1 px-3 py-1 bg-[#F8FAFC] border border-[#c6c6cd] rounded-md text-[11px] font-bold hover:bg-[#eff4ff] transition-colors disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 bg-slate-100 animate-pulse rounded"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 text-center space-y-3">
          <p className="text-xs text-red-600 font-medium">{errorMsg || 'Unable to load recent requests'}</p>
          <button
            onClick={fetchRequests}
            className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#76777d]">
          No recent service requests available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#c6c6cd]">
              <tr>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Ticket</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Customer</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider text-center">Priority</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Vendor</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Created</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-[#45464d] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]">
              {requests.map((r) => {
                const customerName =
                  r.customer?.companyName ||
                  `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}`.trim() ||
                  'Unknown Customer';
                const vendorName = r.assignedVendor?.businessName || '—';
                const createdDate = new Date(r.createdAt).toISOString().split('T')[0];

                return (
                  <tr key={r.id} className="hover:bg-[#eff4ff] transition-colors text-[13px]">
                    <td className="px-5 py-2.5 font-mono text-xs font-bold text-[#006591]">
                      <a href={`/service-requests/${r.id}`} className="hover:underline">
                        {r.ticketNumber}
                      </a>
                    </td>
                    <td className="px-5 py-2.5 font-medium text-[#0b1c30]">{customerName}</td>
                    <td className="px-5 py-2.5 text-center">{getPriorityBadge(r.priority)}</td>
                    <td className="px-5 py-2.5">{getStatusBadge(r.status)}</td>
                    <td className="px-5 py-2.5 text-[#45464d]">{vendorName}</td>
                    <td className="px-5 py-2.5 text-[#45464d] font-mono text-[11px]">{createdDate}</td>
                    <td className="px-5 py-2.5 text-right">
                      <a href={`/service-requests/${r.id}`} className="text-[#006591] hover:underline font-bold text-[11px]">
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
