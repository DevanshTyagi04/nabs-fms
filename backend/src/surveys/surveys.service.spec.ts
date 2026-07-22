import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RequestStatus, SurveySeverity, SurveyStatus } from '@prisma/client';
import { SurveyStateService } from './state/survey-state.service';
import { SurveysService } from './surveys.service';

describe('Surveys Module (Phase 5 Unit & Integration Tests)', () => {
  let surveysService: SurveysService;
  let stateService: SurveyStateService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      vendorProfile: {
        findFirst: jest.fn(),
      },
      customerProfile: {
        findFirst: jest.fn(),
      },
      serviceRequest: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      serviceRequestHistory: {
        create: jest.fn().mockResolvedValue({ id: 'srh-1' }),
      },
      survey: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      surveyItem: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
      },
      comment: {
        create: jest.fn().mockResolvedValue({ id: 'c-1', comment: 'Review notes' }),
      },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    stateService = new SurveyStateService(prismaMock);
    surveysService = new SurveysService(prismaMock, stateService);
  });

  describe('SurveyStateService (State Machine Transitions)', () => {
    it('should allow valid transition DRAFT -> SUBMITTED', () => {
      expect(stateService.canTransition(SurveyStatus.DRAFT, SurveyStatus.SUBMITTED)).toBe(true);
    });

    it('should allow valid transition SUBMITTED -> APPROVED', () => {
      expect(stateService.canTransition(SurveyStatus.SUBMITTED, SurveyStatus.APPROVED)).toBe(true);
    });

    it('should disallow invalid transition SUPERSEDED -> SUBMITTED', () => {
      expect(stateService.canTransition(SurveyStatus.SUPERSEDED, SurveyStatus.SUBMITTED)).toBe(false);
    });

    it('should throw UnprocessableEntityException on invalid state transition', async () => {
      await expect(
        stateService.transitionStatus(prismaMock, {
          surveyId: 'srv-1',
          currentStatus: SurveyStatus.SUPERSEDED,
          targetStatus: SurveyStatus.SUBMITTED,
          expectedVersion: 1,
          actorUserId: 'u-vendor',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ConflictException on optimistic concurrency mismatch', async () => {
      prismaMock.survey.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        stateService.transitionStatus(prismaMock, {
          surveyId: 'srv-1',
          currentStatus: SurveyStatus.DRAFT,
          targetStatus: SurveyStatus.SUBMITTED,
          expectedVersion: 1,
          actorUserId: 'u-vendor',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('SurveysService Vendor Operations', () => {
    it('should create survey draft for assigned vendor', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-1',
        assignedVendorId: 'v-1',
        status: RequestStatus.ASSIGNED,
      });
      prismaMock.survey.findMany.mockResolvedValue([]);
      prismaMock.survey.create.mockResolvedValue({
        id: 'srv-1',
        serviceRequestId: 'sr-1',
        version: 1,
        status: SurveyStatus.DRAFT,
      });

      const res = await surveysService.createOrVersionSurveyVendor('u-vendor', {
        serviceRequestId: 'sr-1',
        notes: 'Initial inspection notes',
      });

      expect(res.survey?.version).toBe(1);
      expect(res.survey?.status).toBe(SurveyStatus.DRAFT);
    });

    it('should create version 2 and supersede version 1 when a submitted survey exists', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-1',
        assignedVendorId: 'v-1',
        status: RequestStatus.SURVEY_SUBMITTED,
      });
      prismaMock.survey.findMany.mockResolvedValue([
        { id: 'srv-v1', version: 1, status: SurveyStatus.SUBMITTED },
      ]);
      prismaMock.survey.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.survey.findUnique.mockResolvedValue({ serviceRequestId: 'sr-1' });
      prismaMock.survey.create.mockResolvedValue({
        id: 'srv-v2',
        serviceRequestId: 'sr-1',
        version: 2,
        status: SurveyStatus.DRAFT,
      });

      const res = await surveysService.createOrVersionSurveyVendor('u-vendor', {
        serviceRequestId: 'sr-1',
        notes: 'Revised inspection notes',
      });

      expect(res.survey?.version).toBe(2);
      expect(res.message).toContain('version 2');
    });

    it('should fail submission if survey has 0 inspection items', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.survey.findFirst.mockResolvedValue({
        id: 'srv-empty',
        vendorId: 'v-1',
        status: SurveyStatus.DRAFT,
        version: 1,
        items: [],
        attachments: [],
      });

      await expect(
        surveysService.submitSurveyVendor('u-vendor', 'srv-empty'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should submit survey successfully when validation rules pass', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.survey.findFirst.mockResolvedValue({
        id: 'srv-valid',
        vendorId: 'v-1',
        status: SurveyStatus.DRAFT,
        version: 1,
        items: [
          {
            id: 'item-1',
            area: 'Roof Unit',
            element: 'Compressor',
            observation: 'Coil damaged',
            isMandatory: true,
            photoRequired: true,
          },
        ],
        attachments: [{ id: 'att-1', surveyItemId: 'item-1' }],
      });

      prismaMock.survey.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.survey.findUnique.mockResolvedValue({ serviceRequestId: 'sr-1' });

      const res = await surveysService.submitSurveyVendor('u-vendor', 'srv-valid');

      expect(res.message).toContain('submitted successfully');
      expect(prismaMock.serviceRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: { status: RequestStatus.SURVEY_SUBMITTED },
      });
    });
  });

  describe('SurveysService Customer Restrictions', () => {
    it('should forbid customer from viewing survey in DRAFT status', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.survey.findFirst.mockResolvedValue({
        id: 'srv-draft',
        status: SurveyStatus.DRAFT,
        serviceRequest: { customerId: 'c-1' },
      });

      await expect(
        surveysService.getCustomerSurveyById('u-cust', 'srv-draft'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
