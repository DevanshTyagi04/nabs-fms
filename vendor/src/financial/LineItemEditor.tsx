import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function LineItemEditor({ onAdd }: { onAdd: (item: LineItem) => void }) {
  const { colors } = useTheme();
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('100');

  const handleAdd = () => {
    if (!description.trim()) return;
    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unitPrice) || 0;
    onAdd({
      id: `item-${Date.now()}`,
      description: description.trim(),
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    });
    setDescription('');
    setQuantity('1');
    setUnitPrice('100');
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.cardForeground }]}>Add Line Item to Quotation</Text>

      <TextInput
        placeholder="Item Description (e.g. Labor / Parts)"
        placeholderTextColor={colors.mutedForeground}
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { backgroundColor: colors.background, color: colors.cardForeground, borderColor: colors.border }]}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextInput
          placeholder="Qty"
          placeholderTextColor={colors.mutedForeground}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.cardForeground, borderColor: colors.border }]}
        />
        <TextInput
          placeholder="Unit Price ($)"
          placeholderTextColor={colors.mutedForeground}
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
          style={[styles.input, { flex: 2, backgroundColor: colors.background, color: colors.cardForeground, borderColor: colors.border }]}
        />
      </View>

      <Button variant="primary" size="sm" onPress={handleAdd}>
        + Add Item
      </Button>
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
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
  },
});
