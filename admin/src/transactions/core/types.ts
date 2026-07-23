export interface Transaction {
  id: string;
  transactionNumber: string;
  type: 'PAYMENT' | 'REFUND' | 'ADJUSTMENT' | 'CREDIT';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod?: string;
  gatewayName: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  createdAt: string;
}

export interface TransactionStatusConfig {
  status: string;
  label: string;
  variant: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  isRetryable: boolean;
  isRefundable: boolean;
}

export interface TransactionEvent {
  id: string;
  type: 'CREATED' | 'CHECKOUT_STARTED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'RECONCILED';
  actor: string;
  timestamp: string;
  description: string;
}
