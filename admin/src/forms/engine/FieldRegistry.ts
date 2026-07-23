import React from 'react';
import { FieldType, FormFieldDefinition } from './types';

export interface FieldComponentProps {
  field: FormFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
}

export type FieldComponent = React.ComponentType<FieldComponentProps>;

export class FieldRegistry {
  private static registry: Map<FieldType, FieldComponent> = new Map();

  static register(type: FieldType, component: FieldComponent) {
    this.registry.set(type, component);
  }

  static get(type: FieldType): FieldComponent | undefined {
    return this.registry.get(type);
  }

  static has(type: FieldType): boolean {
    return this.registry.has(type);
  }
}
