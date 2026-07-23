'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';

import { useStorage, useUpload, useSignedUrl } from '@/features/storage/hooks';
import { StorageService } from '@/features/storage/api/StorageService';
import { UploadDropzone } from '@/storage/components/UploadDropzone';
import { AssetCard } from '@/storage/components/AssetCard';
import { Asset } from '@/storage/core/types';
import { useToast } from '@/hooks/useToast';

const STORAGE_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search file name or storage key...',
  },
  {
    key: 'category',
    type: 'status',
    label: 'Storage Category',
    placeholder: 'All Storage Categories',
    options: [
      { label: 'Profile Avatars', value: 'avatars' },
      { label: 'Inspection Attachments', value: 'attachments' },
      { label: 'Generated Invoices', value: 'invoices' },
      { label: 'Temporary Staging', value: 'temp' },
    ],
  },
];

export default function AdminStoragePage() {
  const toast = useToast();
  const { assets, loading: storageLoading, filters, setFilters, refetch } = useStorage({
    page: 1,
    pageSize: 12,
    search: '',
    category: 'ALL',
  });

  const { uploadFile, loading: uploadLoading } = useUpload();
  const { fetchSignedUrl } = useSignedUrl();

  const handleFileUpload = async (file: File) => {
    try {
      await uploadFile(file, (filters.category !== 'ALL' && filters.category) ? filters.category : 'attachments');
      toast.success('File Uploaded', `File ${file.name} uploaded successfully.`);
      refetch();
    } catch {
      toast.error('Upload Failed', 'Failed to upload file to storage.');
    }
  };

  const handleDownload = async (asset: Asset) => {
    const signedUrl = await fetchSignedUrl(asset.key);
    window.open(signedUrl, '_blank');
  };

  const handleDelete = async (asset: Asset) => {
    try {
      await StorageService.deleteFile(asset.key);
      toast.success('File Deleted', `File ${asset.originalName} deleted.`);
      refetch();
    } catch {
      toast.error('Delete Failed', 'Failed to delete file.');
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="File & Storage Management"
              description="Manage uploaded media assets, technical attachments, signed download links, and storage categories."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={STORAGE_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 12,
                  search: '',
                  category: 'ALL',
                })
              }
            />

            {/* File Upload Dropzone */}
            <UploadDropzone
              category={filters.category !== 'ALL' ? filters.category : 'attachments'}
              onFileSelect={handleFileUpload}
              loading={uploadLoading}
            />

            {/* Storage Asset Grid Gallery */}
            <div>
              {storageLoading ? (
                <div className="p-8 text-center text-slate-500">Loading storage assets...</div>
              ) : assets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  No storage assets match your search or filter parameters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
