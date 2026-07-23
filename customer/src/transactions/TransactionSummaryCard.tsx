import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface TransactionSummaryCardProps {
  amount: number;
  paymentMethod: string;
  transactionNumber: string;
  status: string;
}

export function TransactionSummaryCard({ amount, paymentMethod, transactionNumber, status }: TransactionSummaryCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.cardForeground }]}>Transaction Summary</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Ref Number:</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{transactionNumber}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Amount Paid:</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>${amount.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Payment Channel:</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>{paymentMethod}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
  },
});
