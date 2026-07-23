import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color }: SpinnerProps) {
  const { colors } = useTheme();

  const indicatorSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'small';
  const resolvedColor = color || colors.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={indicatorSize} color={resolvedColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
