import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconName } from '@packages/shared-types';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No data available',
  description = 'There are no items to display at this time.',
  icon = 'file-text',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.muted }]}>
        <Icon name={icon} size="xl" color="muted" />
      </View>
      <Text style={[styles.title, { color: colors.cardForeground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      {actionLabel && onAction ? (
        <Button size="sm" onPress={onAction} style={{ marginTop: 12 }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
        <Icon name="alert-circle" size="xl" color="error" />
      </View>
      <Text style={[styles.title, { color: colors.error }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      {onRetry ? (
        <Button variant="danger" size="sm" leftIcon="refresh" onPress={onRetry} style={{ marginTop: 12 }}>
          Try Again
        </Button>
      ) : null}
    </View>
  );
}

export function OfflineState() {
  const { colors } = useTheme();

  return (
    <View style={[styles.offlineBanner, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '40' }]}>
      <Icon name="wifi-off" color="warning" size="md" />
      <Text style={[styles.offlineText, { color: colors.cardForeground }]}>
        Offline Mode: Network unavailable. Changes will sync when reconnected.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  iconCircle: {
    padding: 12,
    borderRadius: 999,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
