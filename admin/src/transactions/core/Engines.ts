import { Transaction, TransactionStatusConfig } from './types';

export class RazorpayProvider {
  static providerName = 'Razorpay';

  static normalizeCheckoutSession(data: any) {
    return {
      orderId: data.razorpayOrderId || data.id,
      amount: data.amount,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
    };
  }
}

export class TransactionStatusRegistry {
  private static statusMap: Record<string, TransactionStatusConfig> = {
    PENDING: { status: 'PENDING', label: 'Payment Pending', variant: 'warning', isRetryable: true, isRefundable: false },
    SUCCESS: { status: 'SUCCESS', label: 'Captured & Verified', variant: 'success', isRetryable: false, isRefundable: true },
    FAILED: { status: 'FAILED', label: 'Payment Failed', variant: 'error', isRetryable: true, isRefundable: false },
    REFUNDED: { status: 'REFUNDED', label: 'Refunded', variant: 'neutral', isRetryable: false, isRefundable: false },
    CANCELLED: { status: 'CANCELLED', label: 'Cancelled Session', variant: 'neutral', isRetryable: false, isRefundable: false },
  };

  static getConfig(status: string): TransactionStatusConfig {
    return this.statusMap[status] || { status, label: status, variant: 'neutral', isRetryable: false, isRefundable: false };
  }
}

export class ReceiptEngine {
  static formatReceiptNumber(transactionNumber: string): string {
    return `REC-${transactionNumber.replace(/^PAY-/, '')}`;
  }
}

export class ReconciliationEngine {
  static isReconciled(status: string): boolean {
    return status === 'SUCCESS' || status === 'REFUNDED';
  }
}

export class TransactionEngine {
  static evaluate(transaction: Transaction) {
    const statusConfig = TransactionStatusRegistry.getConfig(transaction.status);
    const receiptNumber = ReceiptEngine.formatReceiptNumber(transaction.transactionNumber);
    const isReconciled = ReconciliationEngine.isReconciled(transaction.status);

    return {
      statusConfig,
      receiptNumber,
      isReconciled,
    };
  }
}
