'use client';

import React, { useState } from 'react';
import { AvatarSize } from '@packages/shared-types';
import { cn } from '@/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n?: string) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeMap: Record<AvatarSize, { container: string; text: string; status: string }> = {
    sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2' },
    md: { container: 'w-10 h-10', text: 'text-sm font-semibold', status: 'w-2.5 h-2.5' },
    lg: { container: 'w-14 h-14', text: 'text-lg font-bold', status: 'w-3.5 h-3.5' },
  };

  const statusColorMap = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0 border border-slate-300 dark:border-slate-700',
          sizeMap[size].container,
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={sizeMap[size].text}>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900',
            sizeMap[size].status,
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
}
