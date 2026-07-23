import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onPress={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onPress={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <View style={[styles.box, { backgroundColor: colors.muted }]}>
        <Icon name={variant === 'danger' ? 'alert-triangle' : 'info'} color={variant === 'danger' ? 'error' : 'primary'} size="lg" />
        <Text style={[styles.boxText, { color: colors.cardForeground }]}>
          Are you sure you want to proceed with this action?
        </Text>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  boxText: {
    fontSize: 13,
    flex: 1,
  },
});
