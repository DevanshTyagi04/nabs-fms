'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { ADMIN_NAV_ITEMS } from '@/constants';
import { cn } from '@/utils/cn';

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              NABS
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Admin Console</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-xs mx-auto">
            N
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size="sm" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {ADMIN_NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
              collapsed && 'justify-center px-0'
            )}
          >
            <Icon name={item.icon} size="md" />
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </div>
    </aside>
  );
}

export function TopNavigation({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const { resolvedMode, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Icon name="menu" size="md" />
        </button>
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Phase 1 Design System Foundation</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
          <Icon name={resolvedMode === 'dark' ? 'sun' : 'moon'} size="sm" />
        </Button>
        <Avatar name="Admin User" size="sm" status="online" />
      </div>
    </header>
  );
}

export function ContentContainer({ children }: { children: React.ReactNode }) {
  return <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">{children}</div>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={cn('flex-1 flex flex-col transition-all duration-300', collapsed ? 'md:ml-16' : 'md:ml-64')}>
        <TopNavigation onMobileMenuToggle={() => setCollapsed(!collapsed)} />
        <main className="flex-1">
          <ContentContainer>{children}</ContentContainer>
        </main>
      </div>
    </div>
  );
}
