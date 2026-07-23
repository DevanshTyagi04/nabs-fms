'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../api/NotificationService';
import { NotificationItemDomain, NotificationFilters } from '../types';

export function useNotifications(initialFilters: NotificationFilters) {
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters);
  const [notifications, setNotifications] = useState<NotificationItemDomain[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await NotificationService.listNotifications(filters);
      setNotifications(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchNotifications,
  };
}

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { unreadCount, refetchCount: fetchCount };
}

export function useMarkAsRead() {
  const [loading, setLoading] = useState(false);

  const markAsRead = async (id: string) => {
    setLoading(true);
    try {
      await NotificationService.markAsRead(id);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await NotificationService.markAllAsRead();
    } finally {
      setLoading(false);
    }
  };

  return { markAsRead, markAllAsRead, loading };
}
