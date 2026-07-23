'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn('flex flex-col gap-1.5 w-full', className)}>{children}</div>;
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, className, ...props }: FormLabelProps) {
  return (
    <label className={cn('text-xs font-medium text-slate-700 dark:text-slate-300', className)} {...props}>
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );
}

export function FormMessage({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return <span className={cn('text-xs text-rose-600 dark:text-rose-400 font-medium', className)}>{children}</span>;
}

export function FormHelperText({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return <span className={cn('text-xs text-slate-500 dark:text-slate-400', className)}>{children}</span>;
}
