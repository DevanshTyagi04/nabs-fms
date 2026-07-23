'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import { FormField, FormLabel, FormMessage, FormHelperText } from '@/components/forms/FormField';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, OfflineState } from '@/components/feedback/States';
import { useToast } from '@/hooks/useToast';
import { useTheme } from '@/hooks/useTheme';
import { lightColors, darkColors } from '@packages/design-tokens';
import { getStatusBadgeVariant } from '@/utils/formatters';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useAuth } from '@/auth/hooks/useAuth';

export default function AdminDesignSystemShowcase() {
  const { mode, resolvedMode, toggleTheme } = useTheme();
  const { user, role, permissions, logout } = useAuth();
  const toast = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(65);
  const [btnLoading, setBtnLoading] = useState(false);

  const colors = resolvedMode === 'dark' ? darkColors : lightColors;

  const triggerToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    if (type === 'success') toast.success('Operation Successful', 'The requested change was applied cleanly.');
    if (type === 'error') toast.error('Error Occurred', 'Failed to connect to backend service.');
    if (type === 'warning') toast.warning('Warning Alert', 'Your quota is approaching maximum limit.');
    if (type === 'info') toast.info('System Update', 'New platform feature flags available.');
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" className="bg-blue-700/50 text-blue-100 border-blue-500/30">
                  Phase 2 Auth
                </Badge>
                <span className="text-xs text-blue-200">Authenticated Admin Console</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.firstName || user?.email || 'Admin'}</h1>
              <p className="text-sm text-blue-100 mt-1 max-w-2xl">
                Logged in as <span className="font-semibold">{user?.email}</span> (Role: <span className="font-semibold">{role}</span>, Permissions: {permissions.join(', ')})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" leftIcon={resolvedMode === 'dark' ? 'sun' : 'moon'} onClick={toggleTheme}>
                Mode: {mode} ({resolvedMode})
              </Button>
              <Button variant="danger" size="md" leftIcon="x" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>

          <OfflineState />

          {/* User Authentication Context Box */}
          <Card>
            <CardHeader>
              <CardTitle>Authenticated User Context (Phase 2)</CardTitle>
              <CardDescription>Live session information retrieved via NabsClient SDK (/api/v1/auth/me)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">User ID</span>
                  <span className="text-sm font-mono truncate block">{user?.id}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Email</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.email}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Role</span>
                  <Badge variant="primary" dot>{role || 'UNKNOWN'}</Badge>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Status</span>
                  <Badge variant="success" dot>{user?.status || 'ACTIVE'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Theme Tokens & Palette */}
          <Card id="tokens">
            <CardHeader>
              <CardTitle>Semantic Color Tokens</CardTitle>
              <CardDescription>
                All components consume semantic theme tokens (Primary, Surface, Success, Warning, Error, Border) without hardcoded color values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(colors).map(([token, hex]) => (
                  <div key={token} className="flex flex-col p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="h-10 rounded-md mb-2 shadow-inner border border-black/10" style={{ backgroundColor: hex }} />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{token}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">{hex}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2. Core Buttons */}
          <Card id="components">
            <CardHeader>
              <CardTitle>Buttons & Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </CardContent>
          </Card>

          {/* Dialog Components */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Design System Dialog Modal"
            description="This modal demonstrates accessible overlay, ESC key closing, and focus handling."
            footer={
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Close Modal
              </Button>
            }
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Modal dialogs are fully decoupled from business domain logic and consume standard layout tokens.
            </p>
          </Dialog>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              toast.success('Confirmed', 'Destructive action was approved.');
            }}
            title="Confirm Destructive Action"
            description="This operation cannot be undone. Are you sure you wish to proceed?"
          />
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
