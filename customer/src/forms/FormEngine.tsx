import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface FormEngineProps {
  rating?: number;
  notes?: string;
}

export function FormEngine({ rating = 5, notes = 'Technical assessment verified.' }: FormEngineProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>Completed Technical Inspection</Text>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Equipment Rating Score</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <View
              key={star}
              style={[
                styles.starBtn,
                { backgroundColor: star <= rating ? '#f59e0b' : colors.border },
              ]}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>★</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Technician Assessment Summary</Text>
        <Text style={[styles.notesText, { color: colors.cardForeground }]}>{notes}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
  },
  starBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
