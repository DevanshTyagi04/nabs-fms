import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { ButtonVariant, ButtonSize, IconName } from '@packages/shared-types';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from './Icon';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    let bg = colors.primary;
    let border = 'transparent';

    if (variant === 'secondary') bg = colors.secondary;
    if (variant === 'outline') {
      bg = 'transparent';
      border = colors.border;
    }
    if (variant === 'ghost') bg = 'transparent';
    if (variant === 'danger') bg = colors.error;

    let height = 40;
    let paddingHorizontal = 16;
    if (size === 'sm') {
      height = 32;
      paddingHorizontal = 12;
    }
    if (size === 'lg') {
      height = 48;
      paddingHorizontal = 24;
    }

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: variant === 'outline' ? 1 : 0,
      height,
      paddingHorizontal,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') return colors.cardForeground;
    if (variant === 'danger') return colors.errorForeground;
    if (variant === 'secondary') return colors.secondaryForeground;
    return colors.primaryForeground;
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[getContainerStyle(), style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : leftIcon ? (
        <Icon name={leftIcon} size={size === 'lg' ? 'md' : 'sm'} customColor={textColor} />
      ) : null}

      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: textColor, fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14 }]}>
          {children}
        </Text>
      ) : (
        children
      )}

      {!loading && rightIcon ? (
        <Icon name={rightIcon} size={size === 'lg' ? 'md' : 'sm'} customColor={textColor} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
});
