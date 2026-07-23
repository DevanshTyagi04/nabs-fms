'use client';

import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../api/StorageService';
import { AssetItemDomain, StorageFilters } from '../types';

export function useStorage(initialFilters: StorageFilters) {
  const [filters, setFilters] = useState<StorageFilters>(initialFilters);
  const [assets, setAssets] = useState<AssetItemDomain[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await StorageService.listAssets(filters);
      setAssets(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchAssets,
  };
}

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, category = 'attachments') => {
    setLoading(true);
    setError(null);
    try {
      const asset = await StorageService.uploadFile(file.name, category, file);
      return asset;
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading, error };
}

export function useSignedUrl() {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSignedUrl = async (fileKey: string) => {
    setLoading(true);
    try {
      const url = await StorageService.getSignedUrl(fileKey);
      setSignedUrl(url);
      return url;
    } finally {
      setLoading(false);
    }
  };

  return { signedUrl, fetchSignedUrl, loading };
}
