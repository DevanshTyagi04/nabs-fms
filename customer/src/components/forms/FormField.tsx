import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function FormField({ children }: { children: React.ReactNode }) {
  return <View style={styles.field}>{children}</View>;
}

export function FormLabel({ children, required }: { children: string; required?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.label, { color: colors.cardForeground }]}>
      {children}
      {required ? <Text style={{ color: colors.error }}> *</Text> : null}
    </Text>
  );
}

export function FormMessage({ children }: { children?: string }) {
  const { colors } = useTheme();
  if (!children) return null;
  return <Text style={[styles.message, { color: colors.error }]}>{children}</Text>;
}

export function FormHelperText({ children }: { children?: string }) {
  const { colors } = useTheme();
  if (!children) return null;
  return <Text style={[styles.helper, { color: colors.mutedForeground }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  message: {
    fontSize: 12,
    fontWeight: '500',
  },
  helper: {
    fontSize: 12,
  },
});
