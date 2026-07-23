'use client';

import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export interface EntityFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  children: React.ReactNode;
}

export function EntityFormDialog({
  open,
  onClose,
  title,
  description,
  loading = false,
  error,
  onSubmit,
  submitLabel = 'Save Changes',
  children,
}: EntityFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
            <Icon name="alert-circle" className="text-rose-500 shrink-0" size="sm" />
            <span>{error}</span>
          </div>
        )}

        {children}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
