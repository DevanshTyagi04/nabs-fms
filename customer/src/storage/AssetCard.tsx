import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface MobileAssetCardProps {
  originalName: string;
  category: string;
  sizeFormatted: string;
  createdAt: string;
}

export function AssetCard({ originalName, category, sizeFormatted, createdAt }: MobileAssetCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.cardForeground }]}>{originalName}</Text>
        <Text style={[styles.category, { color: colors.primary }]}>{category}</Text>
      </View>
      <Text style={[styles.size, { color: colors.mutedForeground }]}>Size: {sizeFormatted}</Text>
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        Uploaded: {new Date(createdAt).toLocaleDateString()}
      </Text>
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
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
  },
  size: {
    fontSize: 11,
  },
  date: {
    fontSize: 10,
    marginTop: 2,
  },
});
