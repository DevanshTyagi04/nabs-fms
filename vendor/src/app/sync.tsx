import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Spinner } from '@/components/ui/Spinner';
import { OfflineBanner } from '@/sync/OfflineBanner';
import { useSync } from '@/features/sync/hooks/useSync';

export default function VendorSyncScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/sync');

  const { data, loading } = useSync();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/sync') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Sync & Offline Status" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : !data ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No sync state available.
              </Text>
            ) : (
              <View style={{ gap: 12 }}>
                <OfflineBanner status={data.networkState} pendingCount={data.pendingCount} />
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Last Successful Sync</Text>
                  <Text style={[styles.value, { color: colors.cardForeground }]}>
                    {new Date(data.lastSyncedAt).toLocaleString()}
                  </Text>
                </View>
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
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});
