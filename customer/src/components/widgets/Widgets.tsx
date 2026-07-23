import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { DashboardMetric, DashboardActivity, DashboardAnnouncement, DashboardQuickAction } from '@/types/dashboard';

export function HeroCard({ title, subtitle, badgeLabel = 'Phase 3 Mobile' }: { title: string; subtitle: string; badgeLabel?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
      <Badge variant="primary" dot style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
        {badgeLabel}
      </Badge>
      <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>{title}</Text>
      <Text style={[styles.heroSubtitle, { color: colors.primaryForeground }]}>{subtitle}</Text>
    </View>
  );
}

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.metricHeader}>
        <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{metric.label}</Text>
        <Icon name={metric.icon} size="sm" color="primary" />
      </View>
      <View style={styles.metricRow}>
        <Text style={[styles.metricValue, { color: colors.cardForeground }]}>{metric.value}</Text>
        {metric.trend ? (
          <Badge variant="info" size="sm">{metric.trend}</Badge>
        ) : null}
      </View>
      {metric.description ? (
        <Text style={[styles.metricDesc, { color: colors.mutedForeground }]}>{metric.description}</Text>
      ) : null}
    </View>
  );
}

export function ActivityCard({ activities, title = 'Recent Activity' }: { activities: DashboardActivity[]; title?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>{title}</Text>
      <View style={{ gap: 8 }}>
        {activities.map((item) => (
          <View key={item.id} style={[styles.activityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="check-circle" size="md" color="success" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actTitle, { color: colors.cardForeground }]}>{item.title}</Text>
              {item.subtitle ? <Text style={[styles.actSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text> : null}
            </View>
            {item.statusLabel ? <Badge variant="success" size="sm">{item.statusLabel}</Badge> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function InfoCard({ announcements, title = 'Recent Notices' }: { announcements: DashboardAnnouncement[]; title?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>{title}</Text>
      <View style={{ gap: 8 }}>
        {announcements.map((item) => (
          <View key={item.id} style={[styles.infoItem, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <View style={styles.infoHead}>
              <Badge variant="primary" size="sm">{item.category}</Badge>
              <Text style={[styles.infoDate, { color: colors.mutedForeground }]}>{item.date}</Text>
            </View>
            <Text style={[styles.infoTitle, { color: colors.cardForeground }]}>{item.title}</Text>
            <Text style={[styles.infoMsg, { color: colors.mutedForeground }]}>{item.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function QuickActionCard({ actions, onSelect, title = 'Quick Actions' }: { actions: DashboardQuickAction[]; onSelect?: (href: string) => void; title?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>{title}</Text>
      <View style={styles.grid}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            disabled={act.disabled}
            onPress={() => onSelect && onSelect(act.href)}
            style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }, act.disabled && { opacity: 0.5 }]}
          >
            <Icon name={act.icon} size="md" color="primary" />
            <Text style={[styles.gridText, { color: colors.cardForeground }]}>{act.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function InfoPanel({ title = 'System Status' }: { title?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.infoHead}>
        <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>{title}</Text>
        <Badge variant="success" dot>Operational</Badge>
      </View>
      <Text style={[styles.infoMsg, { color: colors.mutedForeground }]}>
        Phase 3 mobile foundation active. Modular slot layouts & navigation registry ready.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 12,
    opacity: 0.9,
  },
  metricCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricDesc: {
    fontSize: 11,
  },
  sectionCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  actSub: {
    fontSize: 11,
  },
  infoItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  infoHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoDate: {
    fontSize: 11,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoMsg: {
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
