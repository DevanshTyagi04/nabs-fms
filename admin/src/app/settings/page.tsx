'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { InfoPanel } from '@/components/widgets/ActionsAndPanel';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  System Settings & Preferences
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure platform parameters, security policies, and feature flags.
                </p>
              </div>
              <Badge variant="primary">Phase 3 Foundation</Badge>
            </div>

            <InfoPanel title="Configuration Overview" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="settings" size="md" className="text-blue-600" />
                    <span>General System Settings</span>
                  </CardTitle>
                  <CardDescription>Platform preferences and localization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <span>Default Currency</span>
                    <span className="font-semibold">USD ($)</span>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <span>Timezone</span>
                    <span className="font-semibold">UTC (Universal Time)</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="lock" size="md" className="text-blue-600" />
                    <span>Security & Authentication</span>
                  </CardTitle>
                  <CardDescription>JWT and session policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <span>Access Token Lifespan</span>
                    <span className="font-semibold">15 Minutes (900s)</span>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <span>Token Rotation Strategy</span>
                    <span className="font-semibold">O(1) JTI Rotation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
