import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';

export function WorkflowStatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETED') return <Badge variant="success" dot>Completed</Badge>;
  if (status === 'IN_PROGRESS') return <Badge variant="primary" dot>In Progress</Badge>;
  if (status === 'ASSIGNED') return <Badge variant="info" dot>Vendor Assigned</Badge>;
  if (status === 'CANCELLED') return <Badge variant="neutral">Cancelled</Badge>;
  return <Badge variant="warning" dot>Submitted</Badge>;
}

export function WorkflowTimeline({ events }: { events: Array<{ id: string; description: string; timestamp: string; actor: string }> }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.timelineTitle, { color: colors.cardForeground }]}>Service Progress Tracker</Text>
      <View style={{ gap: 10 }}>
        {events.map((evt) => (
          <View key={evt.id} style={styles.eventItem}>
            <Icon name="check-circle" size="sm" color="primary" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.evtDesc, { color: colors.cardForeground }]}>{evt.description}</Text>
              <Text style={[styles.evtMeta, { color: colors.mutedForeground }]}>{evt.timestamp}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  evtDesc: {
    fontSize: 12,
    fontWeight: '600',
  },
  evtMeta: {
    fontSize: 10,
  },
});
