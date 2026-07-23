import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BadgeVariant, BadgeSize } from '@packages/shared-types';
import { useTheme } from '@/hooks/useTheme';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({ variant = 'primary', size = 'md', dot = false, children, style }: BadgeProps) {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary + '20', text: colors.primary, border: colors.primary + '40' };
      case 'secondary':
        return { bg: colors.secondary + '20', text: colors.secondary, border: colors.secondary + '40' };
      case 'success':
        return { bg: colors.success + '20', text: colors.success, border: colors.success + '40' };
      case 'warning':
        return { bg: colors.warning + '20', text: colors.warning, border: colors.warning + '40' };
      case 'error':
        return { bg: colors.error + '20', text: colors.error, border: colors.error + '40' };
      case 'info':
        return { bg: colors.info + '20', text: colors.info, border: colors.info + '40' };
      default:
        return { bg: colors.muted, text: colors.mutedForeground, border: colors.border };
    }
  };

  const { bg, text, border } = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        size === 'sm' ? styles.sm : styles.md,
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: text }]} /> : null}
      <Text style={[styles.text, { color: text, fontSize: size === 'sm' ? 11 : 12 }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    gap: 4,
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
  },
});
