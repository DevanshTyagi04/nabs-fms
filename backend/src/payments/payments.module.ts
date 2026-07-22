import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma';
import { ServiceRequestsModule } from '../service-requests';
import { AdminPaymentController } from './admin-payments.controller';
import { CustomerPaymentController } from './customer-payments.controller';
import { PAYMENT_GATEWAY_TOKEN } from './gateway/interfaces/payment-gateway.interface';
import { MockPaymentGateway } from './gateway/mock-payment.gateway';
import { RazorpayService } from './gateway/razorpay.service';
import { PaymentsService } from './payments.service';
import { PaymentStateService } from './state/payment-state.service';

@Module({
  imports: [PrismaModule, ServiceRequestsModule, EventEmitterModule],
  controllers: [CustomerPaymentController, AdminPaymentController],
  providers: [
    PaymentsService,
    PaymentStateService,
    RazorpayService,
    MockPaymentGateway,
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      useClass: RazorpayService,
    },
  ],
  exports: [PaymentsService, PaymentStateService, PAYMENT_GATEWAY_TOKEN],
})
export class PaymentsModule {}
