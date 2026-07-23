import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { IconName, IconSize } from '@packages/shared-types';
import { iconSizes } from '@packages/design-tokens';
import { useTheme } from '@/hooks/useTheme';

export interface IconProps {
  name: IconName;
  size?: IconSize | number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'cardForeground' | 'custom';
  customColor?: string;
}

const ICON_MAP: Record<IconName, { library: 'feather' | 'ionicons'; name: string }> = {
  user: { library: 'feather', name: 'user' },
  lock: { library: 'feather', name: 'lock' },
  mail: { library: 'feather', name: 'mail' },
  check: { library: 'feather', name: 'check' },
  x: { library: 'feather', name: 'x' },
  'chevron-down': { library: 'feather', name: 'chevron-down' },
  'chevron-right': { library: 'feather', name: 'chevron-right' },
  'chevron-left': { library: 'feather', name: 'chevron-left' },
  search: { library: 'feather', name: 'search' },
  bell: { library: 'feather', name: 'bell' },
  menu: { library: 'feather', name: 'menu' },
  settings: { library: 'feather', name: 'settings' },
  'alert-circle': { library: 'feather', name: 'alert-circle' },
  info: { library: 'feather', name: 'info' },
  'check-circle': { library: 'feather', name: 'check-circle' },
  'alert-triangle': { library: 'feather', name: 'alert-triangle' },
  home: { library: 'feather', name: 'home' },
  grid: { library: 'feather', name: 'grid' },
  briefcase: { library: 'feather', name: 'briefcase' },
  'file-text': { library: 'feather', name: 'file-text' },
  calendar: { library: 'feather', name: 'calendar' },
  refresh: { library: 'feather', name: 'refresh-cw' },
  eye: { library: 'feather', name: 'eye' },
  'eye-off': { library: 'feather', name: 'eye-off' },
  moon: { library: 'feather', name: 'moon' },
  sun: { library: 'feather', name: 'sun' },
  'wifi-off': { library: 'feather', name: 'wifi-off' },
};

export function Icon({ name, size = 'md', color = 'cardForeground', customColor }: IconProps) {
  const { colors } = useTheme();
  const numericSize = typeof size === 'number' ? size : iconSizes[size] || 20;

  let resolvedColor = colors.cardForeground;
  if (customColor) {
    resolvedColor = customColor;
  } else if (color === 'primary') resolvedColor = colors.primary;
  else if (color === 'secondary') resolvedColor = colors.secondary;
  else if (color === 'success') resolvedColor = colors.success;
  else if (color === 'warning') resolvedColor = colors.warning;
  else if (color === 'error') resolvedColor = colors.error;
  else if (color === 'info') resolvedColor = colors.info;
  else if (color === 'muted') resolvedColor = colors.mutedForeground;

  const spec = ICON_MAP[name] || { library: 'feather', name: 'help-circle' };

  if (spec.library === 'ionicons') {
    return <Ionicons name={spec.name as any} size={numericSize} color={resolvedColor} />;
  }

  return <Feather name={spec.name as any} size={numericSize} color={resolvedColor} />;
}
