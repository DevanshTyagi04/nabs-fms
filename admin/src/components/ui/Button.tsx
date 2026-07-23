'use client';

import React from 'react';
import { ButtonVariant, ButtonSize, IconName } from '@packages/shared-types';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 focus-visible:ring-blue-600',
      secondary:
        'bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 focus-visible:ring-slate-500',
      outline:
        'border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 focus-visible:ring-slate-400',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:ring-slate-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 focus-visible:ring-rose-600',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    const isIconOnly = !children && (leftIcon || rightIcon);

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isIconOnly && 'px-0 aspect-square',
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : (
          leftIcon && <Icon name={leftIcon} size={size === 'lg' ? 'md' : 'sm'} />
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <Icon name={rightIcon} size={size === 'lg' ? 'md' : 'sm'} />}
      </button>
    );
  }
);

Button.displayName = 'Button';
