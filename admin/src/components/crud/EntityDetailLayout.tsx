'use client';

import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

export interface DetailSectionProps {
  title?: string;
  fields: DetailField[];
}

export function DetailSection({ title, fields }: DetailSectionProps) {
  return (
    <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {fields.map((field, idx) => (
          <div key={idx}>
            <span className="text-slate-400 font-medium block">{field.label}</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5 block">{field.value || 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface EntityHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  avatarName?: string;
}

export function EntityHeader({ title, subtitle, badge, avatarName }: EntityHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
      {avatarName && <Avatar name={avatarName} size="md" status="online" />}
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export interface EntityDetailModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function EntityDetailModal({ open, onClose, title = 'Item Details', header, children }: EntityDetailModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 pt-2">
        {header}
        {children}
      </div>
    </Dialog>
  );
}
