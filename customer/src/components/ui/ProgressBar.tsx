import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function ProgressBar({ value, max = 100, showLabel = false, color = 'primary' }: ProgressBarProps) {
  const { colors } = useTheme();
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const barColor =
    color === 'success'
      ? colors.success
      : color === 'warning'
      ? colors.warning
      : color === 'error'
      ? colors.error
      : colors.primary;

  return (
    <View style={styles.container}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.cardForeground }]}>Progress</Text>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{Math.round(percentage)}%</Text>
        </View>
      ) : null}

      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
