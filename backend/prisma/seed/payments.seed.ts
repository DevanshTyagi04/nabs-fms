import {
  Payment,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PrismaClient,
} from '@prisma/client';
import { SeededServiceRequest } from './service-requests.seed';
import { getRandomElement, getRandomInt } from './data-generators';

export interface SeededPayment {
  payment: Payment;
  serviceRequest: SeededServiceRequest;
}

export async function seedPayments(
  prisma: PrismaClient,
  serviceRequests: SeededServiceRequest[],
  targetPaymentCount: number = 100,
): Promise<SeededPayment[]> {
  console.log(`💳 Seeding ${targetPaymentCount} Payment Transactions...`);

  // Filter requests that require payment (ADVANCE_*, FINAL_PAYMENT_PENDING, COMPLETED, etc.)
  const eligibleRequests = serviceRequests.filter((sr) => {
    const st = sr.request.status;
    return (
      st === 'ADVANCE_PENDING' ||
      st === 'ADVANCE_RECEIVED' ||
      st === 'FINAL_PAYMENT_PENDING' ||
      st === 'COMPLETED' ||
      st === 'QUALITY_CHECK' ||
      st === 'ARCHIVED'
    );
  });

  const seededPayments: SeededPayment[] = [];

  for (let i = 0; i < Math.min(targetPaymentCount, eligibleRequests.length); i++) {
    const sr = eligibleRequests[i];
    const reqStatus = sr.request.status;

    let type: PaymentType = PaymentType.FINAL;
    let status: PaymentStatus = PaymentStatus.SUCCESS;
    let gateway: PaymentGateway = PaymentGateway.RAZORPAY;
    let paymentMethod: PaymentMethod | null = PaymentMethod.UPI;

    if (reqStatus === 'ADVANCE_PENDING') {
      type = PaymentType.ADVANCE;
      status = PaymentStatus.PENDING;
    } else if (reqStatus === 'ADVANCE_RECEIVED') {
      type = PaymentType.ADVANCE;
      status = PaymentStatus.SUCCESS;
    } else if (i % 12 === 0) {
      // Failed payment edge case
      type = PaymentType.FINAL;
      status = PaymentStatus.FAILED;
      gateway = PaymentGateway.RAZORPAY;
      paymentMethod = PaymentMethod.CARD;
    } else if (i % 15 === 0) {
      // Refund edge case
      type = PaymentType.REFUND;
      status = PaymentStatus.REFUNDED;
      gateway = PaymentGateway.BANK_TRANSFER;
      paymentMethod = PaymentMethod.BANK_TRANSFER;
    }

    const year = i <= 50 ? '2025' : '2026';
    const paymentNumber = `PAY-${year}-${String(i + 1).padStart(4, '0')}`;
    const amount = getRandomInt(1500, 45000);
    const createdAt = new Date(sr.request.createdAt.getTime() + 12000000);
    const paidAt = status === PaymentStatus.SUCCESS || status === PaymentStatus.REFUNDED ? new Date(createdAt.getTime() + 600000) : null;

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        serviceRequestId: sr.request.id,
        amount,
        type,
        status,
        gateway,
        gatewayTransactionId: status === PaymentStatus.SUCCESS ? `pay_rzp_${i + 1000}xyz` : null,
        gatewayOrderId: `order_rzp_${i + 5000}abc`,
        paymentMethod,
        paidAt,
        version: 1,
        createdAt,
      },
    });

    seededPayments.push({ payment, serviceRequest: sr });
  }

  console.log(`✅ ${seededPayments.length} Payment records seeded.`);
  return seededPayments;
}
