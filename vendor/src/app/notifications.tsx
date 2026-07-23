import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Spinner } from '@/components/ui/Spinner';
import { EventCard } from '@/events/EventCard';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

export default function VendorNotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/notifications');

  const { notifications, loading } = useNotifications();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/notifications') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Notifications" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : notifications.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active notifications.
              </Text>
            ) : (
              notifications.map((n) => (
                <EventCard
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  category={n.category}
                  isRead={n.isRead}
                  createdAt={n.createdAt}
                  onPress={() => router.push(n.targetRoute as any)}
                />
              ))
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
