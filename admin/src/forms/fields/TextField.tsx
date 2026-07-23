'use client';

import React from 'react';
import { FieldComponentProps } from '../engine/FieldRegistry';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export function TextField({ field, value, onChange, disabled, error }: FieldComponentProps) {
  if (field.type === 'textarea') {
    return (
      <Textarea
        label={field.label}
        placeholder={field.placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        error={error}
        rows={3}
      />
    );
  }

  return (
    <Input
      label={field.label}
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      placeholder={field.placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      error={error}
    />
  );
}
