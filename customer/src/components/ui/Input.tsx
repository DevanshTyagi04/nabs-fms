import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { IconName } from '@packages/shared-types';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from './Icon';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconClick?: () => void;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, onRightIconClick, editable = true, style, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <View style={styles.fieldContainer}>
        {label ? <Text style={[styles.label, { color: colors.cardForeground }]}>{label}</Text> : null}

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
            },
            !editable && { opacity: 0.6, backgroundColor: colors.muted },
          ]}
        >
          {leftIcon ? (
            <View style={styles.iconLeft}>
              <Icon name={leftIcon} size="sm" color="muted" />
            </View>
          ) : null}

          <TextInput
            ref={ref}
            editable={editable}
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              { color: colors.cardForeground },
              leftIcon && { paddingLeft: 0 },
              rightIcon && { paddingRight: 0 },
              style,
            ]}
            {...props}
          />

          {rightIcon ? (
            <TouchableOpacity
              disabled={!onRightIconClick}
              onPress={onRightIconClick}
              style={styles.iconRight}
            >
              <Icon name={rightIcon} size="sm" color="muted" />
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : helperText ? (
          <Text style={[styles.helperText, { color: colors.mutedForeground }]}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  fieldContainer: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
  },
});
