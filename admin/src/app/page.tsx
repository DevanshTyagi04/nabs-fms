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
import { Icon } from '@/components/ui/Icon';
import { FormField, FormLabel, FormMessage, FormHelperText } from '@/components/forms/FormField';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, OfflineState } from '@/components/feedback/States';
import { useToast } from '@/hooks/useToast';
import { useTheme } from '@/hooks/useTheme';
import { lightColors, darkColors } from '@packages/design-tokens';
import { getStatusBadgeVariant } from '@/utils/formatters';

export default function AdminDesignSystemShowcase() {
  const { mode, resolvedMode, toggleTheme } = useTheme();
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
    <AppLayout>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" className="bg-blue-700/50 text-blue-100 border-blue-500/30">
              Phase 1
            </Badge>
            <span className="text-xs text-blue-200">Design System & Foundation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Web Design System Showcase</h1>
          <p className="text-sm text-blue-100 mt-1 max-w-2xl">
            Production-ready reusable component foundation and semantic tokens for NABS Field Service Management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" leftIcon={resolvedMode === 'dark' ? 'sun' : 'moon'} onClick={toggleTheme}>
            Mode: {mode} ({resolvedMode})
          </Button>
        </div>
      </div>

      {/* Offline Banner Preview */}
      <OfflineState />

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

      {/* 2. Typography Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>Standardized typography definitions (Display, Heading, Title, Body, Caption, Label).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-mono block mb-1">Display (36px / Bold)</span>
            <p className="text-3xl font-bold tracking-tight">NABS Field Service Platform</p>
          </div>
          <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-mono block mb-1">Heading (24px / Bold)</span>
            <h2 className="text-2xl font-bold">Executive Operations Overview</h2>
          </div>
          <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-mono block mb-1">Title (18px / SemiBold)</span>
            <h3 className="text-lg font-semibold">Service Request & Technician Details</h3>
          </div>
          <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-mono block mb-1">Body (14px / Regular)</span>
            <p className="text-sm">Standard body text used across tables, forms, cards, and modal dialog bodies.</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono block mb-1">Caption & Label (12-13px)</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Timestamp: 2026-07-23 12:45 UTC | Status: Verified</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Core Buttons */}
      <Card id="components">
        <CardHeader>
          <CardTitle>Buttons & Variants</CardTitle>
          <CardDescription>Supported button variants, sizes, icon slots, and loading/disabled states.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" leftIcon="check">Small</Button>
            <Button size="md" leftIcon="briefcase">Medium</Button>
            <Button size="lg" rightIcon="chevron-right">Large</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button loading={btnLoading} onClick={() => { setBtnLoading(true); setTimeout(() => setBtnLoading(false), 2000); }}>
              {btnLoading ? 'Processing...' : 'Click to Load'}
            </Button>
            <Button disabled leftIcon="lock">Disabled State</Button>
            <Button variant="outline" leftIcon="refresh" aria-label="Refresh data" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Form Inputs & Password Input */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs & Password Input</CardTitle>
          <CardDescription>Reusable input primitives with icon slots, error states, and helper text.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Email Address" placeholder="admin@nabs.com" leftIcon="mail" helperText="We will never share your email." />
          <PasswordInput label="Password" placeholder="Enter password" />
          <Input label="Search Query" placeholder="Search technician by ID..." leftIcon="search" rightIcon="x" />
          <Input label="Invalid Input State" defaultValue="invalid-email-format" error="Please enter a valid email address." leftIcon="alert-circle" />
          <div className="md:col-span-2">
            <Textarea label="Notes & Description" placeholder="Enter optional notes..." helperText="Maximum 500 characters." />
          </div>
        </CardContent>
      </Card>

      {/* 5. Badges, Avatars & Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Badges, Domain Status & Avatars</CardTitle>
          <CardDescription>Status indicators mapped to FSM domain status tokens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary" dot>Primary</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="error" dot>Error</Badge>
            <Badge variant="info" dot>Info</Badge>
            <Badge variant="neutral" dot>Neutral</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={getStatusBadgeVariant('PENDING')} dot>Domain: PENDING</Badge>
            <Badge variant={getStatusBadgeVariant('IN_PROGRESS')} dot>Domain: IN_PROGRESS</Badge>
            <Badge variant={getStatusBadgeVariant('COMPLETED')} dot>Domain: COMPLETED</Badge>
            <Badge variant={getStatusBadgeVariant('CANCELLED')} dot>Domain: CANCELLED</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Avatar name="Sarah Connor" size="sm" status="online" />
            <Avatar name="John Doe" size="md" status="away" />
            <Avatar name="Marcus Wright" size="lg" status="busy" />
          </div>
        </CardContent>
      </Card>

      {/* 6. Spinners, Skeletons & Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States & Skeletons</CardTitle>
          <CardDescription>Spinners, pulse skeleton placeholders, and progress indicators.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>

          <div className="space-y-3">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="w-10 h-10" />
              <Skeleton variant="rectangular" className="h-12 flex-1" />
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <ProgressBar value={progressVal} showLabel color="primary" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setProgressVal(Math.max(0, progressVal - 15))}>- 15%</Button>
              <Button size="sm" variant="outline" onClick={() => setProgressVal(Math.min(100, progressVal + 15))}>+ 15%</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Dialogs & Toast Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Dialogs & Toast Notifications</CardTitle>
          <CardDescription>Accessible modals, confirmation dialogs, and floating toast alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setDialogOpen(true)}>Open Modal Dialog</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open Confirm Dialog</Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="sm" variant="outline" leftIcon="check-circle" onClick={() => triggerToast('success')}>Success Toast</Button>
            <Button size="sm" variant="outline" leftIcon="alert-circle" onClick={() => triggerToast('error')}>Error Toast</Button>
            <Button size="sm" variant="outline" leftIcon="alert-triangle" onClick={() => triggerToast('warning')}>Warning Toast</Button>
            <Button size="sm" variant="outline" leftIcon="info" onClick={() => triggerToast('info')}>Info Toast</Button>
          </div>
        </CardContent>
      </Card>

      {/* 8. Empty & Error Feedback States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmptyState
          title="No Field Technicians Assigned"
          description="There are currently no active field technicians assigned to this region."
          actionLabel="Assign Technician"
          onAction={() => toast.info('Action Triggered', 'Assign technician drawer would open.')}
        />
        <ErrorState
          title="Failed to Load Service Map"
          description="Unable to reach map tiles API server. Check network connection."
          onRetry={() => toast.info('Retrying', 'Retrying map connection...')}
        />
      </div>

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
  );
}
