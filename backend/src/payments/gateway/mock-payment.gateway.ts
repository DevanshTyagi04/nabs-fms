import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderResult, IPaymentGateway, VerifySignatureParams } from './interfaces/payment-gateway.interface';

@Injectable()
export class MockPaymentGateway implements IPaymentGateway {
  private readonly logger = new Logger(MockPaymentGateway.name);

  async createOrder(amountInUnits: number, currency: string = 'INR', receiptId: string): Promise<CreateOrderResult> {
    const gatewayOrderId = `order_mock_${receiptId.slice(0, 8)}`;
    return {
      gatewayOrderId,
      amount: amountInUnits,
      currency,
    };
  }

  async verifyPaymentSignature(params: VerifySignatureParams): Promise<boolean> {
    if (params.signature.includes('invalid') || params.signature.includes('bad')) {
      return false;
    }
    return true;
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    return !signature.includes('invalid');
  }
}
