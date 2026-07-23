import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ label, error, helperText, editable = true, numberOfLines = 4, style, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <View style={styles.fieldContainer}>
        {label ? <Text style={[styles.label, { color: colors.cardForeground }]}>{label}</Text> : null}

        <TextInput
          ref={ref}
          multiline
          numberOfLines={numberOfLines}
          editable={editable}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.textarea,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
              color: colors.cardForeground,
            },
            !editable && { opacity: 0.6, backgroundColor: colors.muted },
            style,
          ]}
          {...props}
        />

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : helperText ? (
          <Text style={[styles.helperText, { color: colors.mutedForeground }]}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  fieldContainer: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  textarea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
  },
});
