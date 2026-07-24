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

export default function CustomerReportsScreen() {
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
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="My Service & Billing Summary" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : !data ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No summary metrics available.
              </Text>
            ) : (
              <View style={{ gap: 12 }}>
                <MetricCard title="Total Service Requests" value={data.totalRequests.toString()} trendText="Active Account" />
                <MetricCard title="Total Financial Spent" value={data.totalSpentFormatted} trendText="Verified Invoices" />
                <MetricCard title="Settled Transactions" value={data.paidTransactionsCount.toString()} trendText="Fully Reconciled" />
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
