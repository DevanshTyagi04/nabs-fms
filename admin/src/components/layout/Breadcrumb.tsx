'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationRegistry } from '@/navigation/registry';
import { Icon } from '@/components/ui/Icon';

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = NavigationRegistry.getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400">
      <ol className="flex items-center space-x-1.5">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center space-x-1.5">
              {idx > 0 && <Icon name="chevron-right" size="xs" className="text-slate-400 shrink-0" />}
              {isLast ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
                  {crumb.title}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {crumb.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
