import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
import { FinancialSummary } from '@/financial/FinancialSummary';
import { useEstimates } from '@/features/estimates/hooks/useEstimates';

export default function CustomerEstimatesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('/estimates');

  const { estimates, loading, approveEstimate, rejectEstimate } = useEstimates();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/estimates') {
      router.push(href as any);
    }
  };

  const handleApprove = async (id: string, ticket: string) => {
    await approveEstimate(id);
    toast.success('Quotation Approved', `Estimate ${ticket} approved. Work order generation initiated.`);
  };

  const handleReject = async (id: string, ticket: string) => {
    await rejectEstimate(id);
    toast.success('Quotation Declined', `Estimate ${ticket} rejected.`);
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="Quotation Estimates" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : estimates.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active quotation estimates pending review.
              </Text>
            ) : (
              estimates.map((est) => (
                <Card key={est.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.ticketNo, { color: colors.primary }]}>{est.ticketNumber}</Text>
                      <Badge variant={est.status === 'APPROVED' ? 'success' : est.status === 'REJECTED' ? 'error' : 'warning'}>
                        {est.status}
                      </Badge>
                    </View>
                    <CardTitle>{est.title}</CardTitle>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Submitted by {est.vendorName}</Text>
                  </CardHeader>

                  <CardContent style={{ gap: 12 }}>
                    <FinancialSummary
                      subtotal={est.subtotal}
                      tax={est.tax}
                      discount={est.discount}
                      grandTotal={est.grandTotal}
                    />

                    {est.status === 'PENDING_APPROVAL' && (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        <Button variant="danger" size="sm" onPress={() => handleReject(est.id, est.ticketNumber)} style={{ flex: 1 }}>
                          Decline Quote
                        </Button>
                        <Button variant="primary" size="sm" onPress={() => handleApprove(est.id, est.ticketNumber)} style={{ flex: 1 }}>
                          Approve Quote
                        </Button>
                      </View>
                    )}
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
});
