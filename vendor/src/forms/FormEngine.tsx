import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';

export interface FormEngineProps {
  initialRating?: number;
  initialNotes?: string;
  readOnly?: boolean;
  onSubmit?: (val: { rating: number; notes: string }) => void;
}

export function FormEngine({
  initialRating = 4,
  initialNotes = '',
  readOnly = false,
  onSubmit,
}: FormEngineProps) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(initialRating);
  const [notes, setNotes] = useState(initialNotes);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.cardForeground }]}>Field Inspection Form Assessment</Text>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Equipment Rating & Condition (1-5 Stars)</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              disabled={readOnly}
              onPress={() => setRating(star)}
              style={[
                styles.starBtn,
                { backgroundColor: star <= rating ? '#f59e0b' : colors.border },
              ]}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Diagnostic Inspection Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          editable={!readOnly}
          placeholder="Enter diagnostic details..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          style={[styles.textarea, { backgroundColor: colors.background, color: colors.cardForeground, borderColor: colors.border }]}
        />
      </View>

      {!readOnly && onSubmit && (
        <Button variant="primary" onPress={() => onSubmit({ rating, notes })}>
          Save Survey Responses
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textarea: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
    minHeight: 70,
  },
});
