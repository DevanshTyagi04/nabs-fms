'use client';

import React, { useState } from 'react';
import { FormDefinition, FormResponseMap } from './types';
import { FieldRegistry } from './FieldRegistry';
import { FormNavigator } from './helpers';
import { TextField } from '../fields/TextField';
import { RatingField, ChoiceField, PhotoField, SignatureField } from '../fields/Fields';
import { Button } from '@/components/ui/Button';

// Register built-in field components in FieldRegistry
FieldRegistry.register('text', TextField);
FieldRegistry.register('textarea', TextField);
FieldRegistry.register('number', TextField);
FieldRegistry.register('date', TextField);
FieldRegistry.register('rating', RatingField);
FieldRegistry.register('checkbox', ChoiceField);
FieldRegistry.register('radio', ChoiceField);
FieldRegistry.register('dropdown', ChoiceField);
FieldRegistry.register('photo', PhotoField);
FieldRegistry.register('signature', SignatureField);

export interface FormEngineProps {
  definition: FormDefinition;
  initialResponses?: FormResponseMap;
  readOnly?: boolean;
  onSubmit?: (responses: FormResponseMap) => void;
}

export function FormEngine({
  definition,
  initialResponses = {},
  readOnly = false,
  onSubmit,
}: FormEngineProps) {
  const [responses, setResponses] = useState<FormResponseMap>(initialResponses);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [navigator] = useState(() => new FormNavigator(definition));
  const [, setForceUpdate] = useState(0);

  const currentSection = navigator.getCurrentSection();

  const handleFieldChange = (fieldId: string, val: any) => {
    if (readOnly) return;
    setResponses((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const isFieldVisible = (field: any) => {
    if (!field.dependsOn) return true;
    const parentVal = responses[field.dependsOn.fieldId];
    return parentVal === field.dependsOn.equals;
  };

  const validateSection = () => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    currentSection.fields.forEach((field) => {
      if (!isFieldVisible(field)) return;
      if (field.validation?.required) {
        const val = responses[field.id];
        if (val === undefined || val === null || val === '') {
          newErrors[field.id] = `${field.label} is required`;
          valid = false;
        }
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validateSection()) {
      navigator.next();
      setForceUpdate((n) => n + 1);
    }
  };

  const handlePrev = () => {
    navigator.prev();
    setForceUpdate((n) => n + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSection()) {
      if (onSubmit) onSubmit(responses);
    }
  };

  return (
    <div className="space-y-6 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Form Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{definition.title}</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            v{definition.version}.0
          </span>
        </div>
        {definition.description && <p className="text-xs text-slate-500 mt-1">{definition.description}</p>}
      </div>

      {/* Progress Bar */}
      {definition.sections.length > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{currentSection.title}</span>
          <span>
            Section {navigator.getSectionIndex() + 1} of {navigator.getTotalSections()}
          </span>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentSection.fields.map((field) => {
          if (!isFieldVisible(field)) return null;

          const Component = FieldRegistry.get(field.type);
          if (!Component) {
            return (
              <div key={field.id} className="text-xs text-rose-500">
                Unknown field type: {field.type}
              </div>
            );
          }

          return (
            <Component
              key={field.id}
              field={field}
              value={responses[field.id]}
              onChange={(val) => handleFieldChange(field.id, val)}
              disabled={readOnly}
              error={errors[field.id]}
            />
          );
        })}

        {/* Navigation & Submit Controls */}
        {!readOnly && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {navigator.canGoPrev() ? (
              <Button variant="outline" type="button" onClick={handlePrev}>
                Previous Section
              </Button>
            ) : <div />}

            {navigator.canGoNext() ? (
              <Button variant="primary" type="button" onClick={handleNext}>
                Next Section
              </Button>
            ) : (
              <Button variant="primary" type="submit">
                Submit Form
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
