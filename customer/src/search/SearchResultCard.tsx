import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface MobileSearchResultCardProps {
  title: string;
  subtitle: string;
  entityType: string;
  referenceNumber: string;
  onPress?: () => void;
}

export function SearchResultCard({ title, subtitle, entityType, referenceNumber, onPress }: MobileSearchResultCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.refNumber, { color: colors.primary }]}>{referenceNumber}</Text>
        <Text style={[styles.entityType, { color: colors.mutedForeground }]}>{entityType}</Text>
      </View>
      <Text style={[styles.title, { color: colors.cardForeground }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
    </TouchableOpacity>
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
  refNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  entityType: {
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
  },
});
