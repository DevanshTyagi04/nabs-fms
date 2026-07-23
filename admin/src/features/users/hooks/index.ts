'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../api/UserService';
import { User, UserFilters, CreateUserDto, UpdateUserDto } from '../types';
import { UserStatus } from '@packages/shared-types';

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

export function useUser(id: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUser(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    UserService.getUserById(id)
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'User not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { user, loading, error };
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (dto: CreateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.createUser(dto);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (id: string, dto: UpdateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.updateUser(id, dto);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
}

export function useChangeUserStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = async (id: string, status: UserStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.setUserStatus(id, status);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to change user status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeStatus, loading, error };
}

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.getProfile();
      setProfile(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}
