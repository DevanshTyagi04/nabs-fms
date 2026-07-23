import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface MobileEventCardProps {
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  onPress?: () => void;
}

export function EventCard({ title, message, category, isRead, createdAt, onPress }: MobileEventCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isRead ? colors.surface : colors.background,
          borderColor: isRead ? colors.border : colors.primary,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.cardForeground }]}>{title}</Text>
        <Text style={[styles.category, { color: colors.primary }]}>{category}</Text>
      </View>
      <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        {new Date(createdAt).toLocaleString()}
      </Text>
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
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
  },
  date: {
    fontSize: 10,
    marginTop: 2,
  },
});
