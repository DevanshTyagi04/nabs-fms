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
import { TransactionSummaryCard } from '@/transactions/TransactionSummaryCard';
import { usePayments } from '@/features/payments/hooks/usePayments';

export default function CustomerPaymentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/payments');

  const { payments, loading } = usePayments();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/payments') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="Payment Receipts" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : payments.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active payment transactions.
              </Text>
            ) : (
              payments.map((p) => (
                <Card key={p.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.payNumber, { color: colors.primary }]}>{p.paymentNumber}</Text>
                      <Badge variant={p.status === 'SUCCESS' ? 'success' : 'warning'}>{p.status}</Badge>
                    </View>
                    <CardTitle>Payment Receipt for {p.ticketNumber}</CardTitle>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Vendor: {p.vendorName}</Text>
                  </CardHeader>

                  <CardContent style={{ gap: 12 }}>
                    <TransactionSummaryCard
                      amount={p.amount}
                      paymentMethod={p.paymentMethod}
                      transactionNumber={p.paymentNumber}
                      status={p.status}
                    />
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
  payNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
});
