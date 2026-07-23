'use client';

import React from 'react';
import { IconName } from '@packages/shared-types';
import { Icon } from './Icon';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, onRightIconClick, className, disabled, id, ...props },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Icon name={leftIcon} size="sm" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3 text-sm rounded-md border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-500 focus:ring-rose-500 dark:border-rose-500 dark:focus:ring-rose-500',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              tabIndex={onRightIconClick ? 0 : -1}
              className={cn(
                'absolute right-3 text-slate-400 dark:text-slate-500',
                onRightIconClick ? 'cursor-pointer hover:text-slate-600 dark:hover:text-slate-300' : 'pointer-events-none'
              )}
            >
              <Icon name={rightIcon} size="sm" />
            </button>
          )}
        </div>

        {error ? (
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
