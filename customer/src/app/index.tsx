import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useAuth } from '@/auth/hooks/useAuth';
import { MobileLayout } from '@/components/layout/Layout';
import { OfflineState } from '@/components/feedback/States';
import {
  HeroCard,
  MetricCard,
  ActivityCard,
  InfoCard,
  QuickActionCard,
  InfoPanel,
} from '@/components/widgets/Widgets';
import {
  CUSTOMER_PLACEHOLDER_METRICS,
  CUSTOMER_PLACEHOLDER_ACTIVITIES,
  CUSTOMER_PLACEHOLDER_ANNOUNCEMENTS,
  CUSTOMER_PLACEHOLDER_QUICK_ACTIONS,
} from '@/placeholder/dashboard';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/');

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="Customer Mobile Console" activeTab={activeTab} onTabChange={handleTabChange}>
          {/* 1. Hero Card */}
          <HeroCard
            title={`Welcome, ${user?.firstName || user?.email || 'Customer'}`}
            subtitle="NABS Customer Application Shell & Dashboard Framework"
            badgeLabel="Phase 3 Mobile"
          />

          <OfflineState />

          {/* 2. Metrics Grid */}
          <View style={styles.metricsContainer}>
            {CUSTOMER_PLACEHOLDER_METRICS.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </View>

          {/* 3. Quick Actions */}
          <QuickActionCard
            actions={CUSTOMER_PLACEHOLDER_QUICK_ACTIONS}
            title="Quick Shortcuts"
            onSelect={(href) => handleTabChange(href)}
          />

          {/* 4. Activity & Announcements */}
          <ActivityCard activities={CUSTOMER_PLACEHOLDER_ACTIVITIES} title="Recent Events" />
          <InfoCard announcements={CUSTOMER_PLACEHOLDER_ANNOUNCEMENTS} title="System Updates" />
          <InfoPanel title="Operational Status" />
        </MobileLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  metricsContainer: {
    gap: 10,
  },
});
