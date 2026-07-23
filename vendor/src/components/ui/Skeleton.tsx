import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

export function Skeleton({ variant = 'text', width, height, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const getStyle = (): ViewStyle => {
    if (variant === 'circular') {
      const size = (height || 40) as number;
      return { width: size, height: size, borderRadius: size / 2 };
    }
    if (variant === 'rectangular') {
      return { width: width || '100%', height: height || 100, borderRadius: 8 };
    }
    return { width: width || '100%', height: height || 16, borderRadius: 4 };
  };

  return (
    <Animated.View
      style={[
        getStyle(),
        { backgroundColor: colors.muted, opacity },
        style,
      ]}
    />
  );
}
