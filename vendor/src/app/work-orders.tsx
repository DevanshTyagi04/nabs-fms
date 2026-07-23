import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { WorkflowStatusBadge, WorkflowTimeline } from '@/components/workflow/WorkflowComponents';
import { useServiceRequests } from '@/features/service-requests/hooks/useServiceRequests';

export default function VendorWorkOrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('/work-orders');

  const { requests, loading, acceptAssignment, rejectAssignment } = useServiceRequests();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/work-orders') {
      router.push(href as any);
    }
  };

  const handleAccept = async (id: string, ticket: string) => {
    await acceptAssignment(id);
    toast.success('Assignment Accepted', `Dispatch ${ticket} acknowledged and work initiated.`);
  };

  const handleReject = async (id: string, ticket: string) => {
    await rejectAssignment(id);
    toast.success('Assignment Rejected', `Dispatch ${ticket} returned to unassigned pool.`);
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Dispatches" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : requests.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active dispatches assigned.
              </Text>
            ) : (
              requests.map((sr) => (
                <Card key={sr.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.ticketNo, { color: colors.primary }]}>{sr.ticketNumber}</Text>
                      <WorkflowStatusBadge status={sr.status} />
                    </View>
                    <CardTitle>{sr.title}</CardTitle>
                  </CardHeader>
                  <CardContent style={{ gap: 10 }}>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{sr.description}</Text>

                    <View style={[styles.row, { borderColor: colors.border }]}>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Address:</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.cardForeground }}>{sr.serviceAddress}</Text>
                    </View>

                    {sr.status === 'ASSIGNED' && (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                        <Button variant="danger" size="sm" onPress={() => handleReject(sr.id, sr.ticketNumber)} style={{ flex: 1 }}>
                          Decline
                        </Button>
                        <Button variant="primary" size="sm" onPress={() => handleAccept(sr.id, sr.ticketNumber)} style={{ flex: 1 }}>
                          Accept & Start
                        </Button>
                      </View>
                    )}

                    <WorkflowTimeline events={sr.history || []} />
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
  ticketNo: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
});
