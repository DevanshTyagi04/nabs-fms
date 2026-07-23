import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ExecutionProgressCard } from '@/execution/ExecutionProgressCard';
import { useWorkOrders } from '@/features/work-orders/hooks/useWorkOrders';

export default function CustomerWorkOrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/work-orders');

  const { workOrders, loading } = useWorkOrders();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/work-orders') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="Work Order Status" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : workOrders.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active work orders.
              </Text>
            ) : (
              workOrders.map((wo) => (
                <Card key={wo.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.woNumber, { color: colors.primary }]}>{wo.workOrderNumber}</Text>
                      <Badge variant={wo.status === 'COMPLETED' || wo.status === 'VERIFIED' ? 'success' : 'warning'}>
                        {wo.status}
                      </Badge>
                    </View>
                    <CardTitle>{wo.title}</CardTitle>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Assigned Vendor: {wo.vendorName}</Text>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Scheduled: {wo.scheduledDate}</Text>
                  </CardHeader>

                  <CardContent style={{ gap: 12 }}>
                    <ExecutionProgressCard
                      percentage={wo.percentage}
                      completedTasks={wo.completedTasks}
                      totalTasks={wo.totalTasks}
                    />

                    <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Approved Quotation Total</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>${wo.grandTotal.toFixed(2)}</Text>
                    </View>
                  </CardContent>
                </Card>
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
    gap: 16,
  },
  cardHeader: {
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  woNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
});
