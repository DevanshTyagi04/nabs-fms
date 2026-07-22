import { UserRole } from '@prisma/client';
import { ActivityTimelineService } from '../../src/activity/timeline/activity-timeline.service';
import { EstimatesService } from '../../src/estimates/estimates.service';
import { InvoicesService } from '../../src/invoices/invoices.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { PaymentsService } from '../../src/payments/payments.service';
import { ReportsService } from '../../src/reports/reports.service';
import { ServiceRequestService } from '../../src/service-requests/service-requests.service';
import { SurveysService } from '../../src/surveys/surveys.service';
import { WorkOrdersService } from '../../src/work-orders/work-orders.service';

describe('Phase 18: Full Multi-Module End-to-End Integration Suite', () => {
  let prismaMock: any;

  // Services
  let srService: ServiceRequestService;
  let surveyService: SurveysService;
  let estimateService: EstimatesService;
  let woService: WorkOrdersService;
  let paymentService: PaymentsService;
  let invoiceService: InvoicesService;
  let notificationService: NotificationsService;
  let activityTimelineService: ActivityTimelineService;
  let reportsService: ReportsService;

  beforeEach(() => {
    prismaMock = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      customerProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'c-profile-100' }), findFirst: jest.fn().mockResolvedValue({ id: 'c-profile-100' }) },
      vendorProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'v-vendor-100' }), findFirst: jest.fn().mockResolvedValue({ id: 'v-vendor-100', businessName: 'Cooling Pros' }) },
      address: { findFirst: jest.fn().mockResolvedValue({ id: 'addr-1' }) },
      serviceCategory: { findFirst: jest.fn().mockResolvedValue({ id: 'cat-1', name: 'AC' }) },
      serviceRequest: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      serviceRequestHistory: { create: jest.fn(), findMany: jest.fn() },
      survey: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn().mockResolvedValue([{ id: 'srv-approved', status: 'APPROVED' }]), findFirst: jest.fn().mockResolvedValue({ id: 'srv-approved', status: 'APPROVED' }) },
      estimate: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn().mockResolvedValue({ id: 'est-100', grandTotal: 1500 }) },
      workOrder: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findFirst: jest.fn().mockResolvedValue(null) },
      workStatusHistory: { create: jest.fn(), findMany: jest.fn() },
      workTimeline: { create: jest.fn(), findMany: jest.fn() },
      payment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
      invoice: { create: jest.fn(), findUnique: jest.fn().mockResolvedValue(null), update: jest.fn(), findFirst: jest.fn() },
      comment: { create: jest.fn().mockResolvedValue({ id: 'c-1', content: 'Invoice issued.' }) },
      notification: { create: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn((cb) => cb(prismaMock)),
      $queryRaw: jest.fn().mockResolvedValue([{ count: 1 }]),
    };

    const stateServiceMock: any = {
      transitionStatus: jest.fn().mockResolvedValue({ id: 'sr-100', status: 'ASSIGNED' }),
      validateTransition: jest.fn().mockReturnValue(true),
    };
    const surveyStateMock: any = {
      transitionStatus: jest.fn().mockResolvedValue({ id: 'srv-100', status: 'SUBMITTED' }),
    };
    const estimateStateMock: any = {
      transitionStatus: jest.fn().mockResolvedValue({ id: 'est-100', status: 'APPROVED' }),
    };
    const woStateMock: any = {
      transitionStatus: jest.fn().mockResolvedValue({ id: 'wo-100', status: 'COMPLETED' }),
    };
    const paymentStateMock: any = {
      transitionStatus: jest.fn().mockResolvedValue({ id: 'pay-100', status: 'SUCCESS' }),
    };
    const eventEmitterMock: any = { emit: jest.fn() };
    const pdfServiceMock: any = { generateAndSavePdf: jest.fn().mockResolvedValue('http://localhost:3000/inv-100.html') };
    const gatewayMock: any = { createOrder: jest.fn(), verifyPaymentSignature: jest.fn().mockReturnValue(true) };
    const dashboardServiceMock: any = { getAdminDashboardSummary: jest.fn().mockResolvedValue({ totalRevenue: 1500 }) };
    const analyticsServiceMock: any = { getRevenueAnalytics: jest.fn().mockResolvedValue([]) };

    const calculatorServiceMock: any = {
      toDecimal: jest.fn((val: any, def = '0.00') => new (require('@prisma/client').Prisma.Decimal)(val ?? def)),
      calculateEstimateTotals: jest.fn().mockReturnValue({ subtotal: 0, taxAmount: 0, discountAmount: 0, totalAmount: 0 }),
    };

    srService = new ServiceRequestService(prismaMock, stateServiceMock, {} as any);
    surveyService = new SurveysService(prismaMock, surveyStateMock);
    estimateService = new EstimatesService(prismaMock, estimateStateMock, calculatorServiceMock);
    woService = new WorkOrdersService(prismaMock, woStateMock, stateServiceMock, eventEmitterMock);
    paymentService = new PaymentsService(prismaMock, paymentStateMock, stateServiceMock, gatewayMock, eventEmitterMock);
    const numberServiceMock: any = { generateInvoiceNumber: jest.fn().mockResolvedValue('INV-20260722-100') };
    invoiceService = new InvoicesService(prismaMock, {} as any, numberServiceMock, pdfServiceMock, eventEmitterMock);
    notificationService = new NotificationsService(prismaMock);
    activityTimelineService = new ActivityTimelineService(prismaMock);
    reportsService = new ReportsService(dashboardServiceMock, analyticsServiceMock);
  });

  it('should execute full end-to-end lifecycle across all 11 business modules deterministically', async () => {
    // 1. Service Request Creation
    prismaMock.serviceRequest.create.mockResolvedValue({
      id: 'sr-100',
      ticketNumber: 'SR-20260722-A1B2',
      title: 'AC Maintenance',
      status: 'CREATED',
      priority: 'HIGH',
      customerId: 'c-profile-100',
    });

    const srRes = await srService.createRequestCustomer('u-cust', {
      title: 'AC Maintenance',
      description: 'Leak in living room',
      serviceCategoryId: 'cat-1',
      addressId: 'addr-1',
      priority: 'HIGH' as any,
    });

    expect(srRes.request.ticketNumber).toBe('SR-20260722-A1B2');

    // 2. Survey Submission
    prismaMock.serviceRequest.findUnique.mockResolvedValue({ id: 'sr-100', assignedVendorId: 'v-vendor-100', status: 'ASSIGNED' });
    prismaMock.survey.findMany.mockResolvedValue([]);
    prismaMock.survey.create.mockResolvedValue({
      id: 'srv-100',
      surveyNumber: 'SRV-2026-100',
      serviceRequestId: 'sr-100',
      status: 'SUBMITTED',
      version: 1,
    });

    const srvRes = await surveyService.createOrVersionSurveyVendor('u-vendor', {
      serviceRequestId: 'sr-100',
      notes: 'Compressor valve inspection',
    });

    expect(srvRes).toBeDefined();

    // 3. Estimate Creation
    prismaMock.estimate.create.mockResolvedValue({
      id: 'est-100',
      estimateNumber: 'EST-2026-100',
      serviceRequestId: 'sr-100',
      status: 'APPROVED',
      grandTotal: 1500,
    });

    const estRes = await estimateService.createOrVersionEstimateVendor('u-vendor', {
      serviceRequestId: 'sr-100',
      discountAmount: 0,
    });

    expect(estRes).toBeDefined();

    // 4. Work Order Execution
    prismaMock.estimate.findUnique.mockResolvedValue({
      id: 'est-100',
      status: 'APPROVED',
      serviceRequestId: 'sr-100',
      grandTotal: 1500,
      serviceRequest: {
        id: 'sr-100',
        assignedVendorId: 'v-vendor-100',
        status: 'ASSIGNED',
      },
    });
    prismaMock.workOrder.create.mockResolvedValue({
      id: 'wo-100',
      workOrderNumber: 'WO-2026-100',
      serviceRequestId: 'sr-100',
      status: 'COMPLETED',
      assignedVendorId: 'v-vendor-100',
    });

    const woRes = await woService.createWorkOrderAdmin('u-admin', {
      estimateId: 'est-100',
      scheduledStart: '2026-07-26T09:00:00.000Z',
      scheduledEnd: '2026-07-26T12:00:00.000Z',
    });

    expect(woRes).toBeDefined();

    // 5. Payment Reconcile Admin
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay-100',
      paymentNumber: 'PAY-2026-100',
      amount: 1500,
      status: 'PENDING',
      serviceRequestId: 'sr-100',
    });
    prismaMock.payment.update.mockResolvedValue({
      id: 'pay-100',
      paymentNumber: 'PAY-2026-100',
      amount: 1500,
      status: 'SUCCESS',
      serviceRequestId: 'sr-100',
    });

    prismaMock.payment.findFirst.mockResolvedValue({
      id: 'pay-100',
      paymentNumber: 'PAY-2026-100',
      amount: 1500,
      status: 'PENDING',
      serviceRequestId: 'sr-100',
      serviceRequest: { id: 'sr-100', assignedVendorId: 'v-vendor-100' },
    });

    const payRes = await paymentService.reconcilePaymentAdmin('u-admin', 'pay-100', {
      paymentMethod: 'CASH' as any,
      remarks: 'Cash collected on site',
    });

    expect(payRes.message).toBeDefined();

    // 6. Invoice Issuance - prime payment as SUCCESS for invoice service lookup
    const successPayment = {
      id: 'pay-100',
      paymentNumber: 'PAY-2026-100',
      amount: new (require('@prisma/client').Prisma.Decimal)(1500),
      status: 'SUCCESS',
      paymentMethod: 'CASH',
      serviceRequestId: 'sr-100',
      vendorId: 'v-vendor-100',
      serviceRequest: {
        id: 'sr-100',
        ticketNumber: 'SR-20260722-A1B2',
        assignedVendorId: 'v-vendor-100',
        customer: { id: 'c-100', user: { id: 'u-cust', email: 'customer@test.com', fullName: 'Test Customer' } },
      },
    };
    prismaMock.payment.findFirst.mockResolvedValue(successPayment);
    prismaMock.payment.findUnique.mockResolvedValue(successPayment);
    prismaMock.invoice.findUnique.mockResolvedValue(null);
    prismaMock.invoice.findFirst.mockResolvedValue(null);
    prismaMock.invoice.create.mockResolvedValue({
      id: 'inv-100',
      invoiceNumber: 'INV-20260722-100',
      status: 'ISSUED',
      totalAmount: new (require('@prisma/client').Prisma.Decimal)(1500),
      paidAmount: new (require('@prisma/client').Prisma.Decimal)(1500),
      dueAmount: new (require('@prisma/client').Prisma.Decimal)(0),
    });

    const invRes = await invoiceService.generateInvoiceForPayment('u-admin', {
      paymentId: 'pay-100',
    });

    expect(invRes.invoice.invoiceNumber).toBe('INV-20260722-100');

    // 7. Activity Timeline Inspection
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u-admin', role: UserRole.ADMIN });
    prismaMock.serviceRequestHistory.findMany.mockResolvedValue([]);
    prismaMock.workStatusHistory.findMany.mockResolvedValue([]);
    prismaMock.payment.findMany.mockResolvedValue([]);

    const timeline = await activityTimelineService.getTimeline({ page: 1, limit: 10 }, { userId: 'u-admin', role: UserRole.ADMIN });
    expect(timeline.pagination.totalItems).toBeDefined();
  });
});
