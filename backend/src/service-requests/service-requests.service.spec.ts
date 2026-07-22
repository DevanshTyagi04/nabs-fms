import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Priority,
  RequestStatus,
  UserStatus,
  VendorAvailabilityStatus,
  VendorVerificationStatus,
} from '@prisma/client';
import { VendorAssignmentService } from './assignment/vendor-assignment.service';
import { ServiceRequestService } from './service-requests.service';
import { RequestStateService } from './state-machine/request-state.service';

describe('ServiceRequest Module (Phase 4 Unit & Integration Tests)', () => {
  let requestService: ServiceRequestService;
  let stateService: RequestStateService;
  let assignmentService: VendorAssignmentService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      customerProfile: {
        findFirst: jest.fn(),
      },
      vendorProfile: {
        findFirst: jest.fn(),
      },
      address: {
        findFirst: jest.fn(),
      },
      serviceCategory: {
        findFirst: jest.fn(),
      },
      serviceRequest: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      serviceRequestHistory: {
        create: jest.fn().mockResolvedValue({ id: 'hist-1' }),
      },
      comment: {
        create: jest.fn().mockResolvedValue({ id: 'note-1', comment: 'Test note', createdAt: new Date() }),
      },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    stateService = new RequestStateService(prismaMock);
    assignmentService = new VendorAssignmentService(prismaMock);
    requestService = new ServiceRequestService(prismaMock, stateService, assignmentService);
  });

  describe('RequestStateService (State Machine Transitions)', () => {
    it('should allow valid transition CREATED -> ASSIGNED', () => {
      expect(stateService.canTransition(RequestStatus.CREATED, RequestStatus.ASSIGNED)).toBe(true);
    });

    it('should allow valid transition ASSIGNED -> CREATED (Vendor Rejection)', () => {
      expect(stateService.canTransition(RequestStatus.ASSIGNED, RequestStatus.CREATED)).toBe(true);
    });

    it('should disallow invalid transition CANCELLED -> ASSIGNED', () => {
      expect(stateService.canTransition(RequestStatus.CANCELLED, RequestStatus.ASSIGNED)).toBe(false);
    });

    it('should throw UnprocessableEntityException on invalid transitionStatus execution', async () => {
      await expect(
        stateService.transitionStatus(prismaMock, {
          requestId: 'req-1',
          currentStatus: RequestStatus.CANCELLED,
          targetStatus: RequestStatus.ASSIGNED,
          expectedVersion: 1,
          actorUserId: 'u-admin',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ConflictException on optimistic concurrency mismatch', async () => {
      prismaMock.serviceRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        stateService.transitionStatus(prismaMock, {
          requestId: 'req-1',
          currentStatus: RequestStatus.CREATED,
          targetStatus: RequestStatus.ASSIGNED,
          expectedVersion: 1,
          actorUserId: 'u-admin',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('VendorAssignmentService', () => {
    it('should throw UnprocessableEntityException if vendor is not VERIFIED', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({
        id: 'v-unverified',
        businessName: 'Unverified Vendor',
        verificationStatus: VendorVerificationStatus.PENDING,
        availabilityStatus: VendorAvailabilityStatus.AVAILABLE,
        user: { status: UserStatus.ACTIVE, deletedAt: null },
      });

      await expect(
        assignmentService.validateVendorEligibility('v-unverified'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if vendor is OFFLINE', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({
        id: 'v-offline',
        businessName: 'Offline Vendor',
        verificationStatus: VendorVerificationStatus.VERIFIED,
        availabilityStatus: VendorAvailabilityStatus.OFFLINE,
        user: { status: UserStatus.ACTIVE, deletedAt: null },
      });

      await expect(
        assignmentService.validateVendorEligibility('v-offline'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('ServiceRequestService Customer Operations', () => {
    it('should create service request with ticket number format SR-YYYYMMDD-XXXX', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.address.findFirst.mockResolvedValue({ id: 'addr-1' });
      prismaMock.serviceCategory.findFirst.mockResolvedValue({ id: 'cat-1', name: 'HVAC' });

      prismaMock.serviceRequest.create.mockResolvedValue({
        id: 'req-1',
        ticketNumber: 'SR-20260722-A1B2',
        title: 'AC Failure',
        status: RequestStatus.CREATED,
      });

      const dto = {
        addressId: 'addr-1',
        serviceCategoryId: 'cat-1',
        title: 'AC Failure',
        description: 'Split unit making buzzing noise',
        priority: Priority.HIGH,
      };

      const res = await requestService.createRequestCustomer('u-cust', dto);

      expect(res.request.ticketNumber).toMatch(/^SR-\d{8}-[A-Z0-9]{4}$/);
      expect(prismaMock.serviceRequestHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fromStatus: null,
          toStatus: RequestStatus.CREATED,
        }),
      });
    });

    it('should throw ForbiddenException if customer tries to access another customer request', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-owner' });
      prismaMock.serviceRequest.findFirst.mockResolvedValue({
        id: 'req-other',
        customerId: 'c-different-customer',
      });

      await expect(
        requestService.getCustomerRequestById('u-cust', 'req-other'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('ServiceRequestService Vendor Operations', () => {
    it('should reject assignment and revert status ASSIGNED -> CREATED with unassigned vendor', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.serviceRequest.findFirst.mockResolvedValue({
        id: 'req-assigned',
        assignedVendorId: 'v-1',
        status: RequestStatus.ASSIGNED,
        version: 2,
      });
      prismaMock.serviceRequest.findUnique.mockResolvedValue({ version: 2 });
      prismaMock.serviceRequest.updateMany.mockResolvedValue({ count: 1 });

      const res = await requestService.rejectAssignmentVendor('u-vendor', 'req-assigned', {
        remarks: 'Schedule conflict',
      });

      expect(res.message).toContain('returned to unassigned pool');
      expect(prismaMock.serviceRequestHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fromStatus: RequestStatus.ASSIGNED,
          toStatus: RequestStatus.CREATED,
        }),
      });
    });
  });
});
