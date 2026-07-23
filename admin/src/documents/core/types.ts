export interface BillingDocument {
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerAddress?: string;
  issuerName?: string;
  notes?: string;
}

export interface DocumentStatusConfig {
  status: string;
  label: string;
  variant: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  isTerminal: boolean;
}

export interface BillingEvent {
  id: string;
  type: 'GENERATED' | 'ISSUED' | 'SENT' | 'VIEWED' | 'REMINDER_SENT' | 'PAYMENT_RECORDED' | 'CANCELLED';
  actor: string;
  timestamp: string;
  description: string;
}
