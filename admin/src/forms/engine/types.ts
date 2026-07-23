export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'rating'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'date'
  | 'time'
  | 'photo'
  | 'signature';

export interface FieldValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface ConditionalVisibilityRule {
  fieldId: string;
  equals: any;
}

export interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: FieldValidationRule;
  dependsOn?: ConditionalVisibilityRule;
  defaultValue?: any;
}

export interface FormSectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldDefinition[];
}

export interface FormDefinition {
  id: string;
  version: number;
  title: string;
  description?: string;
  sections: FormSectionDefinition[];
  metadata?: Record<string, any>;
}

export type FormResponseMap = Record<string, any>;

export interface FormSubmissionPayload {
  formId: string;
  version: number;
  responses: FormResponseMap;
  submittedAt: string;
}
