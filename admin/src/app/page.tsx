'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useAuth } from '@/auth/hooks/useAuth';
import { HeroCard } from '@/components/widgets/HeroCard';
import { MetricCard } from '@/components/widgets/MetricCard';
import { ActivityCard } from '@/components/widgets/ActivityCard';
import { InfoCard } from '@/components/widgets/InfoCard';
import { QuickActionCard, InfoPanel } from '@/components/widgets/ActionsAndPanel';
import {
  ADMIN_PLACEHOLDER_METRICS,
  ADMIN_PLACEHOLDER_ACTIVITIES,
  ADMIN_PLACEHOLDER_ANNOUNCEMENTS,
  ADMIN_PLACEHOLDER_QUICK_ACTIONS,
} from '@/placeholder/dashboard';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-8">
            {/* 1. Hero Card */}
            <HeroCard
              title={`Welcome back, ${user?.firstName || user?.email || 'Admin'}`}
              subtitle="NABS Field Service Management Platform Overview & System Status"
              badgeLabel="Phase 3 Foundation"
            />

            {/* 2. Operational Metrics Grid */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Operational Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ADMIN_PLACEHOLDER_METRICS.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </div>

            {/* 3. Quick Action Grid */}
            <QuickActionCard actions={ADMIN_PLACEHOLDER_QUICK_ACTIONS} title="Quick Actions" />

            {/* 4. Two-Column Activity & Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityCard activities={ADMIN_PLACEHOLDER_ACTIVITIES} title="Recent Activity" />
              <div className="space-y-6">
                <InfoCard announcements={ADMIN_PLACEHOLDER_ANNOUNCEMENTS} title="Recent Notices" />
                <InfoPanel title="System Status" />
              </div>
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
