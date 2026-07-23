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
import { BillingSummaryCard } from '@/documents/BillingSummaryCard';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';

export default function VendorInvoicesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/invoices');

  const { invoices, loading } = useInvoices();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/invoices') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Billing Invoices" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : invoices.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active billing invoices.
              </Text>
            ) : (
              invoices.map((inv) => (
                <Card key={inv.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.invNumber, { color: colors.primary }]}>{inv.invoiceNumber}</Text>
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                    </View>
                    <CardTitle>Invoice for {inv.ticketNumber}</CardTitle>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Customer: {inv.customerName}</Text>
                  </CardHeader>

                  <CardContent style={{ gap: 12 }}>
                    <BillingSummaryCard
                      grandTotal={inv.grandTotal}
                      amountDue={inv.amountDue}
                      dueDate={inv.dueDate}
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
  invNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
});
