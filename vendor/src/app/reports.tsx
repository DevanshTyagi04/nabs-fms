import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Spinner } from '@/components/ui/Spinner';
import { MetricCard } from '@/reports/MetricCard';
import { useReports } from '@/features/reports/hooks/useReports';

export default function VendorReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/reports');

  const { data, loading } = useReports();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/reports') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Performance Analytics" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : !data ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No performance data available.
              </Text>
            ) : (
              <View style={{ gap: 12 }}>
                <MetricCard title="Total Dispatches Assigned" value={data.totalJobs.toString()} trendText="Top Tier Dispatcher" />
                <MetricCard title="Total Net Earned" value={data.earnedFormatted} trendText="+12.4% vs last month" />
                <MetricCard title="Job Completion Rate" value={data.completionRate} trendText="Above Target (95%)" />
              </View>
            )}
          </ScrollView>
        </MobileLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
