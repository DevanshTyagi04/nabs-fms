import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface MobileTimelineCardProps {
  action: string;
  description: string;
  actorName: string;
  formattedDate: string;
}

export function TimelineCard({ action, description, actorName, formattedDate }: MobileTimelineCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{formattedDate}</Text>
      </View>
      <Text style={[styles.description, { color: colors.cardForeground }]}>{description}</Text>
      <Text style={[styles.actor, { color: colors.mutedForeground }]}>By: {actorName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  action: {
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    fontSize: 10,
  },
  description: {
    fontSize: 12,
  },
  actor: {
    fontSize: 10,
    marginTop: 2,
  },
});
