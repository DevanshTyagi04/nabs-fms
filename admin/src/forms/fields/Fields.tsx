'use client';

import React from 'react';
import { FieldComponentProps } from '../engine/FieldRegistry';
import { FormField, FormLabel, FormMessage } from '@/components/forms/FormField';

export function RatingField({ field, value, onChange, disabled, error }: FieldComponentProps) {
  const currentRating = Number(value) || 0;

  return (
    <FormField>
      <FormLabel required={field.validation?.required}>{field.label}</FormLabel>
      <div className="flex items-center gap-1.5 py-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm transition-colors ${
              star <= currentRating
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
            }`}
          >
            ★
          </button>
        ))}
        <span className="text-xs text-slate-500 font-mono ml-2">
          {currentRating > 0 ? `${currentRating} / 5 Stars` : 'Unrated'}
        </span>
      </div>
      <FormMessage>{error}</FormMessage>
    </FormField>
  );
}

export function ChoiceField({ field, value, onChange, disabled, error }: FieldComponentProps) {
  const options = field.options || [
    { label: 'Pass', value: 'PASS' },
    { label: 'Fail', value: 'FAIL' },
    { label: 'N/A', value: 'NA' },
  ];

  if (field.type === 'dropdown') {
    return (
      <FormField>
        <FormLabel required={field.validation?.required}>{field.label}</FormLabel>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-10 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Select option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FormMessage>{error}</FormMessage>
      </FormField>
    );
  }

  return (
    <FormField>
      <FormLabel required={field.validation?.required}>{field.label}</FormLabel>
      <div className="flex flex-wrap items-center gap-3 py-1">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
              name={field.id}
              value={opt.value}
              checked={field.type === 'checkbox' ? Array.isArray(value) && value.includes(opt.value) : value === opt.value}
              onChange={() => onChange(opt.value)}
              disabled={disabled}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      <FormMessage>{error}</FormMessage>
    </FormField>
  );
}

export function PhotoField({ field, value, onChange, disabled, error }: FieldComponentProps) {
  return (
    <FormField>
      <FormLabel required={field.validation?.required}>{field.label}</FormLabel>
      <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-2">
        {value ? (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
            <span>✓ Photo Attached</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-rose-500 underline text-[11px]"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('https://storage.nabs.com/uploads/sample_inspection_photo.jpg')}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            📷 Upload Inspection Photo
          </button>
        )}
      </div>
      <FormMessage>{error}</FormMessage>
    </FormField>
  );
}

export function SignatureField({ field, value, onChange, disabled, error }: FieldComponentProps) {
  return (
    <FormField>
      <FormLabel required={field.validation?.required}>{field.label}</FormLabel>
      <div className="p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-2">
        {value ? (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono italic font-bold">
            Signed: {value}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('Digital Signature Verified')}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
          >
            ✍️ Capture Digital Signature
          </button>
        )}
      </div>
      <FormMessage>{error}</FormMessage>
    </FormField>
  );
}
