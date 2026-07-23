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
import { LineItemEditor, LineItem } from '@/financial/LineItemEditor';
import { useEstimates } from '@/features/estimates/hooks/useEstimates';

export default function VendorEstimatesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('/estimates');

  const { estimates, loading, submitEstimate } = useEstimates();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/estimates') {
      router.push(href as any);
    }
  };

  const handleSubmit = async (id: string, ticket: string) => {
    await submitEstimate(id);
    toast.success('Quotation Submitted', `Estimate ${ticket} submitted to customer for approval.`);
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Quotations" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : estimates.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active quotation estimates.
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
                  </CardHeader>

                  <CardContent style={{ gap: 12 }}>
                    <View style={{ gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.cardForeground }}>Quotation Items:</Text>
                      {est.items.map((item) => (
                        <View key={item.id} style={[styles.row, { borderColor: colors.border }]}>
                          <Text style={{ fontSize: 12, color: colors.cardForeground }}>{item.description} (x{item.quantity})</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>${item.total.toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>

                    {est.status === 'DRAFT' && (
                      <>
                        <LineItemEditor onAdd={() => {}} />
                        <Button variant="primary" onPress={() => handleSubmit(est.id, est.ticketNumber)}>
                          Submit Quotation to Customer
                        </Button>
                      </>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
});
