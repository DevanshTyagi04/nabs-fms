'use client';

import React, { useEffect } from 'react';
import { Icon } from './Icon';
import { cn } from '@/utils/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="x" size="md" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <div className="flex flex-col gap-1 pr-6">
            <h2 id="dialog-title" className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        )}

        {children && <div className="py-2">{children}</div>}

        {footer && <div className="flex items-center justify-end gap-3 pt-2">{footer}</div>}
      </div>
    </div>
  );
}
