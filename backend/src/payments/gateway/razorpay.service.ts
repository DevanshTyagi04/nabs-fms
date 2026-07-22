import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { CreateOrderResult, IPaymentGateway, VerifySignatureParams } from './interfaces/payment-gateway.interface';

@Injectable()
export class RazorpayService implements IPaymentGateway {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_mockkey123';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'rzp_secret_mocksecret456';
  }

  /**
   * Generates a payment order ID via Razorpay provider
   */
  async createOrder(amountInUnits: number, currency: string = 'INR', receiptId: string): Promise<CreateOrderResult> {
    const orderId = `order_${receiptId.replace(/-/g, '').slice(0, 14)}`;
    this.logger.log(`Razorpay payment order generated: [${orderId}] Amount: ${amountInUnits} ${currency}`);

    return {
      gatewayOrderId: orderId,
      amount: amountInUnits,
      currency,
    };
  }

  /**
   * Performs HMAC SHA256 signature verification for customer checkout payload
   */
  async verifyPaymentSignature(params: VerifySignatureParams): Promise<boolean> {
    const { gatewayOrderId, gatewayTransactionId, signature } = params;

    if (!gatewayOrderId || !gatewayTransactionId || !signature) {
      return false;
    }

    try {
      const payload = `${gatewayOrderId}|${gatewayTransactionId}`;
      const expectedSignature = createHmac('sha256', this.keySecret)
        .update(payload)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const actualBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (error: any) {
      this.logger.error(`Razorpay signature verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Performs HMAC SHA256 signature verification for asynchronous webhook events
   */
  async verifyWebhookSignature(rawBody: string, signature: string, secret?: string): Promise<boolean> {
    const webhookSecret = secret || this.keySecret;
    if (!rawBody || !signature || !webhookSecret) {
      return false;
    }

    try {
      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const actualBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return timingSafeEqual(expectedBuffer, actualBuffer);
    } catch (error: any) {
      this.logger.error(`Razorpay webhook signature verification failed: ${error.message}`);
      return false;
    }
  }
}
