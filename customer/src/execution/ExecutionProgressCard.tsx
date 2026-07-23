import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ExecutionProgressCardProps {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
}

export function ExecutionProgressCard({ percentage, completedTasks, totalTasks }: ExecutionProgressCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.cardForeground }]}>Real-Time Execution Progress</Text>
        <Text style={[styles.percentage, { color: colors.primary }]}>{percentage}%</Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
      </View>

      <Text style={[styles.subtext, { color: colors.mutedForeground }]}>
        {completedTasks} of {totalTasks} checklist items completed
      </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  subtext: {
    fontSize: 11,
  },
});
