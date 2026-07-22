export const PAYMENT_GATEWAY_TOKEN = Symbol('PAYMENT_GATEWAY_TOKEN');

export interface CreateOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
}

export interface VerifySignatureParams {
  gatewayOrderId: string;
  gatewayTransactionId: string;
  signature: string;
}

export interface IPaymentGateway {
  /**
   * Generates a payment order with the external payment gateway provider
   */
  createOrder(amountInUnits: number, currency: string, receiptId: string): Promise<CreateOrderResult>;

  /**
   * Performs HMAC signature verification for customer checkout payload
   */
  verifyPaymentSignature(params: VerifySignatureParams): Promise<boolean>;

  /**
   * Performs HMAC signature verification for asynchronous webhook events
   */
  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): Promise<boolean>;
}
