import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface FinancialSummaryProps {
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
}

export function FinancialSummary({ subtotal, tax, discount, grandTotal }: FinancialSummaryProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>Price Breakdown Summary</Text>

      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Subtotal</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>${subtotal.toFixed(2)}</Text>
      </View>

      {discount > 0 && (
        <View style={[styles.row, { borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.error }]}>Discount</Text>
          <Text style={[styles.value, { color: colors.error }]}>-${discount.toFixed(2)}</Text>
        </View>
      )}

      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Estimated Tax (GST/HST)</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>${tax.toFixed(2)}</Text>
      </View>

      <View style={[styles.row, styles.totalRow, { borderColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.cardForeground }]}>Grand Total</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>${grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
