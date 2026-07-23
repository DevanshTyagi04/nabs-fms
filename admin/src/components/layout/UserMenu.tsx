'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const { resolvedMode, toggleTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar name={user?.firstName || user?.email || 'User'} size="sm" status="online" />
        <Icon name="chevron-down" size="xs" className="text-slate-500 dark:text-slate-400 hidden sm:inline-block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            <div className="pt-1">
              <Badge variant="primary" size="sm">{role || 'ADMIN'}</Badge>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Icon name="settings" size="sm" />
              <span>Settings</span>
            </Link>

            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <Icon name={resolvedMode === 'dark' ? 'sun' : 'moon'} size="sm" />
                <span>Theme</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase">{resolvedMode}</span>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Icon name="x" size="sm" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
