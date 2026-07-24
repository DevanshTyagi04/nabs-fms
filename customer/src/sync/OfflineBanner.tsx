import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface MobileOfflineBannerProps {
  status: string;
  pendingCount: number;
}

export function OfflineBanner({ status, pendingCount }: MobileOfflineBannerProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.cardForeground }]}>Status: {status}</Text>
      {pendingCount > 0 && (
        <Text style={[styles.subtext, { color: colors.mutedForeground }]}>
          {pendingCount} offline mutation(s) queued for sync
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 11,
  },
});
