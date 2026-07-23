'use client';

import React from 'react';
import { Money } from '../core/Money';

export interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'primary';
}

export function MoneyDisplay({ amount, currency = 'USD', size = 'md', variant = 'default' }: MoneyDisplayProps) {
  const money = new Money(amount, currency);

  const sizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-bold',
    lg: 'text-lg font-extrabold',
  };

  const variantClasses = {
    default: 'text-slate-900 dark:text-slate-100',
    success: 'text-emerald-600 dark:text-emerald-400',
    primary: 'text-blue-600 dark:text-blue-400',
  };

  return <span className={`${sizeClasses[size]} ${variantClasses[variant]}`}>{money.format()}</span>;
}
