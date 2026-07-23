import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AvatarSize } from '@packages/shared-types';
import { useTheme } from '@/hooks/useTheme';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function Avatar({ src, name, size = 'md', status }: AvatarProps) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  const getInitials = (n?: string) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const dimension = size === 'sm' ? 32 : size === 'lg' ? 56 : 40;
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  const statusColorMap = {
    online: colors.success,
    offline: colors.disabledForeground,
    busy: colors.error,
    away: colors.warning,
  };

  return (
    <View style={{ width: dimension, height: dimension, position: 'relative' }}>
      <View
        style={[
          styles.container,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: colors.muted,
            borderColor: colors.border,
          },
        ]}
      >
        {src && !imageError ? (
          <Image
            source={{ uri: src }}
            onError={() => setImageError(true)}
            style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
          />
        ) : (
          <Text style={[styles.initials, { color: colors.cardForeground, fontSize }]}>{getInitials(name)}</Text>
        )}
      </View>

      {status ? (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: statusColorMap[status],
              borderColor: colors.card,
              width: size === 'sm' ? 8 : size === 'lg' ? 14 : 10,
              height: size === 'sm' ? 8 : size === 'lg' ? 14 : 10,
              borderRadius: 7,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});
