import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, Prisma, RequestStatus, SurveyStatus } from '@prisma/client';
import { PricingCalculatorService } from './calculation/pricing-calculator.service';
import { EstimatesService } from './estimates.service';
import { EstimateStateService } from './state/estimate-state.service';

describe('Estimates Module (Phase 6 Unit & Integration Tests)', () => {
  let estimatesService: EstimatesService;
  let stateService: EstimateStateService;
  let calculatorService: PricingCalculatorService;
  let prismaMock: any;

  beforeEach(() => {
    calculatorService = new PricingCalculatorService();

    prismaMock = {
      vendorProfile: { findFirst: jest.fn() },
      customerProfile: { findFirst: jest.fn() },
      serviceRequest: { findUnique: jest.fn(), updateMany: jest.fn() },
      serviceRequestHistory: { create: jest.fn().mockResolvedValue({ id: 'srh-1' }) },
      survey: { findUnique: jest.fn(), findFirst: jest.fn() },
      estimate: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      estimateItem: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      comment: { create: jest.fn().mockResolvedValue({ id: 'c-1', comment: 'Estimate note' }) },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    stateService = new EstimateStateService(prismaMock);
    estimatesService = new EstimatesService(prismaMock, stateService, calculatorService);
  });

  describe('PricingCalculatorService (Decimal Financial Precision)', () => {
    it('should calculate deterministic line item totals with GST tax', () => {
      const result = calculatorService.calculateLineItem({
        quantity: 2,
        unitPrice: 150,
        taxRate: 18,
        discount: 0,
      });

      expect(result.subtotal.toString()).toBe('300');
      expect(result.taxAmount.toString()).toBe('54');
      expect(result.total.toString()).toBe('354');
    });

    it('should calculate correct estimate totals across multiple items and discounts', () => {
      const items = [
        { quantity: 2, unitPrice: 100, taxRate: 18, discount: 0 }, // subtotal 200, tax 36
        { quantity: 1, unitPrice: 500, taxRate: 18, discount: 50 }, // subtotal 500, tax 81, disc 50
      ];

      const totals = calculatorService.calculateEstimateTotals(items, 20); // overall disc 20

      expect(totals.subtotal.toString()).toBe('700');
      expect(totals.taxAmount.toString()).toBe('117');
      expect(totals.discountAmount.toString()).toBe('70');
      expect(totals.totalAmount.toString()).toBe('747'); // 700 - 70 + 117 = 747
    });
  });

  describe('EstimateStateService (State Machine Transitions)', () => {
    it('should allow valid transition DRAFT -> PENDING_APPROVAL', () => {
      expect(stateService.canTransition(EstimateStatus.DRAFT, EstimateStatus.PENDING_APPROVAL)).toBe(true);
    });

    it('should allow valid transition PENDING_APPROVAL -> APPROVED', () => {
      expect(stateService.canTransition(EstimateStatus.PENDING_APPROVAL, EstimateStatus.APPROVED)).toBe(true);
    });

    it('should disallow invalid transition SUPERSEDED -> APPROVED', () => {
      expect(stateService.canTransition(EstimateStatus.SUPERSEDED, EstimateStatus.APPROVED)).toBe(false);
    });

    it('should throw UnprocessableEntityException on invalid state transition execution', async () => {
      await expect(
        stateService.transitionStatus(prismaMock, {
          estimateId: 'est-1',
          currentStatus: EstimateStatus.SUPERSEDED,
          targetStatus: EstimateStatus.APPROVED,
          expectedVersion: 1,
          actorUserId: 'u-cust',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ConflictException on optimistic concurrency mismatch', async () => {
      prismaMock.estimate.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        stateService.transitionStatus(prismaMock, {
          estimateId: 'est-1',
          currentStatus: EstimateStatus.DRAFT,
          targetStatus: EstimateStatus.PENDING_APPROVAL,
          expectedVersion: 1,
          actorUserId: 'u-vendor',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('EstimatesService Vendor Operations', () => {
    it('should create estimate draft for assigned vendor with approved survey', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-1',
        assignedVendorId: 'v-1',
        status: RequestStatus.SURVEY_APPROVED,
      });
      prismaMock.survey.findFirst.mockResolvedValue({
        id: 'srv-1',
        status: SurveyStatus.APPROVED,
        serviceRequestId: 'sr-1',
      });
      prismaMock.estimate.findMany.mockResolvedValue([]);
      prismaMock.estimate.create.mockResolvedValue({
        id: 'est-1',
        serviceRequestId: 'sr-1',
        version: 1,
        status: EstimateStatus.DRAFT,
        totalAmount: new Prisma.Decimal('0.00'),
      });

      const res = await estimatesService.createOrVersionEstimateVendor('u-vendor', {
        serviceRequestId: 'sr-1',
        termsAndConditions: 'Quote valid 15 days',
      });

      expect(res.estimate!.version).toBe(1);
      expect(res.estimate!.status).toBe(EstimateStatus.DRAFT);
    });

    it('should fail submission if estimate has 0 line items', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.estimate.findFirst.mockResolvedValue({
        id: 'est-empty',
        status: EstimateStatus.DRAFT,
        version: 1,
        totalAmount: new Prisma.Decimal('0.00'),
        serviceRequest: { assignedVendorId: 'v-1' },
        items: [],
      });

      await expect(
        estimatesService.submitEstimateVendor('u-vendor', 'est-empty'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('EstimatesService Customer Operations', () => {
    it('should approve estimate and transition related service request', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.estimate.findFirst.mockResolvedValue({
        id: 'est-valid',
        status: EstimateStatus.PENDING_APPROVAL,
        version: 1,
        validUntil: new Date(Date.now() + 86400000), // 1 day in future
        serviceRequest: { customerId: 'c-1' },
      });
      prismaMock.estimate.findUnique.mockResolvedValue({ serviceRequestId: 'sr-1', version: 1 });
      prismaMock.estimate.updateMany.mockResolvedValue({ count: 1 });

      const res = await estimatesService.approveEstimateCustomer('u-cust', 'est-valid');

      expect(res.message).toContain('approved successfully');
      expect(prismaMock.serviceRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: { status: RequestStatus.AWAITING_APPROVAL },
      });
    });

    it('should reject approval if estimate has expired', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.estimate.findFirst.mockResolvedValue({
        id: 'est-expired',
        status: EstimateStatus.PENDING_APPROVAL,
        version: 1,
        validUntil: new Date(Date.now() - 86400000), // 1 day in past
        serviceRequest: { customerId: 'c-1' },
      });

      await expect(
        estimatesService.approveEstimateCustomer('u-cust', 'est-expired'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should forbid customer from viewing estimate in DRAFT status', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.estimate.findFirst.mockResolvedValue({
        id: 'est-draft',
        status: EstimateStatus.DRAFT,
        serviceRequest: { customerId: 'c-1' },
      });

      await expect(
        estimatesService.getCustomerEstimateById('u-cust', 'est-draft'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
