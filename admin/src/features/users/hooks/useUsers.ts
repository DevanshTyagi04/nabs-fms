'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../api/UserService';
import { User, UserFilters } from '../types';

export function useUsers(initialFilters: UserFilters) {
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.listUsers(filters);
      setUsers(res.users);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchUsers,
  };
}
