'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { ActivityListItem } from '@/lib/types/dashboard.types';

interface ActivityFeedProps {
  refreshTrigger?: number;
}

export function ActivityFeed({ refreshTrigger }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await dashboardApi.getActivityFeed(5);
      setActivities(response.data || []);
    } catch {
      setIsError(true);
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
        const response = await dashboardApi.getActivityFeed(5);
        if (isMounted) {
          setActivities(response.data || []);
        }
      } catch {
        if (isMounted) {
          setIsError(true);
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

  const formatTimestamp = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-lg shadow-sm">
      <div className="px-5 py-3 border-b border-[#c6c6cd] flex justify-between items-center">
        <h2 className="text-[14px] font-bold text-[#0b1c30]">System Activity Feed</h2>
        <button className="text-[11px] font-bold text-[#006591] hover:underline">View All Logs</button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start animate-pulse">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-1"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-red-600 font-medium">Unable to load activity logs</p>
            <button
              onClick={fetchActivity}
              className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#76777d]">
            No recent activity logs available
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((item) => {
              const actionTitle = item.action || 'System Action';
              const description =
                item.details ||
                item.comment ||
                (item.serviceRequest?.ticketNumber
                  ? `Updated ticket ${item.serviceRequest.ticketNumber}`
                  : 'System operation completed');

              return (
                <div key={item.id} className="timeline-item border-l border-slate-200 ml-1.5 pl-4 pb-3 relative">
                  <div className="absolute -left-[4px] top-1 w-2 h-2 rounded-full bg-[#c6c6cd]"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[12px] text-[#0b1c30] font-semibold">
                        {actionTitle}{' '}
                        {item.user?.email && (
                          <span className="text-[#006591] font-medium">({item.user.email})</span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#45464d] mt-0.5">{description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#45464d] whitespace-nowrap bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#c6c6cd]/50">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
