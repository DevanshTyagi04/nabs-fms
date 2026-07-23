import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface BillingSummaryCardProps {
  grandTotal: number;
  amountDue: number;
  dueDate: string;
}

export function BillingSummaryCard({ grandTotal, amountDue, dueDate }: BillingSummaryCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.cardForeground }]}>Financial Billing Statement</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Total Invoiced Amount:</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>${grandTotal.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Amount Outstanding:</Text>
        <Text style={[styles.value, { color: colors.primary }]}>${amountDue.toFixed(2)}</Text>
      </View>
      <Text style={[styles.dueText, { color: colors.mutedForeground }]}>Due Date: {dueDate}</Text>
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
  dueText: {
    fontSize: 11,
    marginTop: 2,
  },
});
