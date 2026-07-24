import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface MobileMetricCardProps {
  title: string;
  value: string;
  trendText: string;
}

export function MetricCard({ title, value, trendText }: MobileMetricCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.cardForeground }]}>{value}</Text>
      <Text style={[styles.trend, { color: colors.primary }]}>{trendText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  trend: {
    fontSize: 11,
    fontWeight: '500',
  },
});
