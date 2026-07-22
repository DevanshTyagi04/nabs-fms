import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, RequestStatus, SurveySeverity, SurveyStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  AddSurveyCommentDto,
  CreateSurveyDto,
  CreateSurveyItemDto,
  QuerySurveyDto,
  ReviewSurveyDto,
  UpdateSurveyItemDto,
  UpdateSurveyNotesDto,
} from './dto';
import { SurveyStateService } from './state/survey-state.service';

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: SurveyStateService,
  ) {}

  /**
   * Helper: Resolves VendorProfile ID or throws ForbiddenException
   */
  private async getVendorProfileOrThrow(userId: string) {
    const profile = await this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true, businessName: true },
    });

    if (!profile) {
      throw new ForbiddenException('Only vendors can access vendor survey endpoints');
    }

    return profile;
  }

  /**
   * Helper: Resolves CustomerProfile ID or throws ForbiddenException
   */
  private async getCustomerProfileOrThrow(userId: string) {
    const profile = await this.prisma.customerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!profile) {
      throw new ForbiddenException('Only customers can access customer survey endpoints');
    }

    return profile;
  }

  // ==============================================================================
  // VENDOR OPERATIONS
  // ==============================================================================

  /**
   * Vendor creates a Survey Draft or new Survey Version for assigned Service Request
   */
  async createOrVersionSurveyVendor(userId: string, dto: CreateSurveyDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    // 1. Verify Service Request assignment & active status
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: dto.serviceRequestId },
      select: { id: true, assignedVendorId: true, status: true },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.assignedVendorId !== vendor.id) {
      throw new ForbiddenException('You are not assigned to this service request');
    }

    if (request.status === RequestStatus.CANCELLED) {
      throw new BadRequestException('Cannot create survey for a cancelled service request');
    }

    // 2. Query existing surveys for this request
    const existingSurveys = await this.prisma.survey.findMany({
      where: { serviceRequestId: dto.serviceRequestId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, status: true },
    });

    const activeDraft = existingSurveys.find((s) => s.status === SurveyStatus.DRAFT);
    if (activeDraft) {
      // Return existing active draft
      return {
        message: 'Active survey draft already exists for this request',
        surveyId: activeDraft.id,
        version: activeDraft.version,
        status: activeDraft.status,
      };
    }

    const latestSurvey = existingSurveys[0];
    const newVersion = latestSurvey ? latestSurvey.version + 1 : 1;

    // 3. Atomic Transaction for Survey creation and old version superseding
    const survey = await this.prisma.$transaction(async (tx) => {
      // If previous version exists, mark as SUPERSEDED
      if (latestSurvey && (latestSurvey.status === SurveyStatus.SUBMITTED || latestSurvey.status === SurveyStatus.APPROVED || latestSurvey.status === SurveyStatus.REJECTED)) {
        await this.stateService.transitionStatus(tx, {
          surveyId: latestSurvey.id,
          currentStatus: latestSurvey.status,
          targetStatus: SurveyStatus.SUPERSEDED,
          expectedVersion: latestSurvey.version,
          actorUserId: userId,
          remarks: `Superseded by version ${newVersion}`,
        });
      }

      return tx.survey.create({
        data: {
          serviceRequestId: dto.serviceRequestId,
          vendorId: vendor.id,
          version: newVersion,
          status: SurveyStatus.DRAFT,
          notes: dto.notes?.trim() || null,
          startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
        },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          notes: true,
          startedAt: true,
          createdAt: true,
        },
      });
    });

    this.logger.log(
      `[AUDIT_EVENT] [SURVEY_CREATED] User: [${userId}] Survey: [${survey.id}] Version: [${survey.version}]`,
    );

    return {
      message: newVersion > 1 ? `Revised survey version ${newVersion} created successfully` : 'Survey draft created successfully',
      survey,
    };
  }

  /**
   * Vendor updates survey notes and startedAt
   */
  async updateSurveyNotesVendor(userId: string, surveyId: string, dto: UpdateSurveyNotesDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId },
      select: { id: true, vendorId: true, status: true, version: true },
    });

    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.vendorId !== vendor.id) throw new ForbiddenException('You do not own this survey');
    if (survey.status !== SurveyStatus.DRAFT) throw new BadRequestException(`Cannot edit survey in status ${survey.status}`);

    const updated = await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
        ...(dto.startedAt !== undefined && { startedAt: new Date(dto.startedAt) }),
      },
      select: { id: true, notes: true, startedAt: true, updatedAt: true },
    });

    this.logger.log(`[AUDIT_EVENT] [SURVEY_UPDATED] User: [${userId}] Survey: [${surveyId}]`);

    return {
      message: 'Survey notes updated successfully',
      survey: updated,
    };
  }

  /**
   * Vendor adds inspection item to Survey draft
   */
  async createSurveyItemVendor(userId: string, surveyId: string, dto: CreateSurveyItemDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId },
      select: { id: true, vendorId: true, status: true },
    });

    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.vendorId !== vendor.id) throw new ForbiddenException('You do not own this survey');
    if (survey.status !== SurveyStatus.DRAFT) throw new BadRequestException('Cannot add items to a submitted or reviewed survey');

    const item = await this.prisma.surveyItem.create({
      data: {
        surveyId,
        area: dto.area.trim(),
        element: dto.element.trim(),
        observation: dto.observation.trim(),
        actionRequired: dto.actionRequired?.trim() || null,
        severity: dto.severity || SurveySeverity.MEDIUM,
        sortOrder: dto.sortOrder || 1,
        isMandatory: dto.isMandatory || false,
        photoRequired: dto.photoRequired || false,
      },
      select: {
        id: true,
        area: true,
        element: true,
        observation: true,
        actionRequired: true,
        severity: true,
        sortOrder: true,
        isMandatory: true,
        photoRequired: true,
        createdAt: true,
      },
    });

    this.logger.log(`[AUDIT_EVENT] [SURVEY_ITEM_CREATED] User: [${userId}] SurveyItem: [${item.id}]`);

    return {
      message: 'Survey item added successfully',
      item,
    };
  }

  /**
   * Vendor updates draft inspection item
   */
  async updateSurveyItemVendor(userId: string, surveyId: string, itemId: string, dto: UpdateSurveyItemDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const item = await this.prisma.surveyItem.findFirst({
      where: { id: itemId, surveyId },
      select: { id: true, survey: { select: { vendorId: true, status: true } } },
    });

    if (!item) throw new NotFoundException('Survey item not found');
    if (item.survey.vendorId !== vendor.id) throw new ForbiddenException('You do not own this survey item');
    if (item.survey.status !== SurveyStatus.DRAFT) throw new BadRequestException('Cannot update items on a submitted survey');

    const updated = await this.prisma.surveyItem.update({
      where: { id: itemId },
      data: {
        ...(dto.area && { area: dto.area.trim() }),
        ...(dto.element && { element: dto.element.trim() }),
        ...(dto.observation && { observation: dto.observation.trim() }),
        ...(dto.actionRequired !== undefined && { actionRequired: dto.actionRequired?.trim() || null }),
        ...(dto.severity && { severity: dto.severity }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isMandatory !== undefined && { isMandatory: dto.isMandatory }),
        ...(dto.photoRequired !== undefined && { photoRequired: dto.photoRequired }),
      },
      select: {
        id: true,
        area: true,
        element: true,
        observation: true,
        actionRequired: true,
        severity: true,
        sortOrder: true,
        isMandatory: true,
        photoRequired: true,
        updatedAt: true,
      },
    });

    this.logger.log(`[AUDIT_EVENT] [SURVEY_ITEM_UPDATED] User: [${userId}] SurveyItem: [${itemId}]`);

    return {
      message: 'Survey item updated successfully',
      item: updated,
    };
  }

  /**
   * Vendor deletes draft inspection item
   */
  async deleteSurveyItemVendor(userId: string, surveyId: string, itemId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const item = await this.prisma.surveyItem.findFirst({
      where: { id: itemId, surveyId },
      select: { id: true, survey: { select: { vendorId: true, status: true } } },
    });

    if (!item) throw new NotFoundException('Survey item not found');
    if (item.survey.vendorId !== vendor.id) throw new ForbiddenException('You do not own this survey item');
    if (item.survey.status !== SurveyStatus.DRAFT) throw new BadRequestException('Cannot delete items from a submitted survey');

    await this.prisma.surveyItem.delete({ where: { id: itemId } });

    this.logger.log(`[AUDIT_EVENT] [SURVEY_ITEM_DELETED] User: [${userId}] SurveyItem: [${itemId}]`);

    return {
      message: 'Survey item deleted successfully',
    };
  }

  /**
   * Vendor submits completed survey (executes submission validations and status transition)
   */
  async submitSurveyVendor(userId: string, surveyId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId },
      select: {
        id: true,
        vendorId: true,
        status: true,
        version: true,
        items: {
          select: { id: true, area: true, element: true, observation: true, isMandatory: true, photoRequired: true },
        },
        attachments: { select: { id: true, surveyItemId: true } },
      },
    });

    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.vendorId !== vendor.id) throw new ForbiddenException('You do not own this survey');
    if (survey.status !== SurveyStatus.DRAFT) throw new BadRequestException(`Survey is already submitted or reviewed (Status: ${survey.status})`);

    // Submission Validation Rules
    if (survey.items.length === 0) {
      throw new UnprocessableEntityException('Cannot submit survey without at least one inspection item');
    }

    const unfulfilledMandatory = survey.items.filter((item) => item.isMandatory && (!item.observation || item.observation.trim().length === 0));
    if (unfulfilledMandatory.length > 0) {
      throw new UnprocessableEntityException(
        `Submission blocked: Mandatory inspection item "${unfulfilledMandatory[0].element}" in area "${unfulfilledMandatory[0].area}" lacks required observation notes`,
      );
    }

    const unfulfilledPhotos = survey.items.filter((item) => {
      if (!item.photoRequired) return false;
      const hasPhoto = survey.attachments.some((a) => a.surveyItemId === item.id);
      return !hasPhoto;
    });

    if (unfulfilledPhotos.length > 0) {
      throw new UnprocessableEntityException(
        `Submission blocked: Inspection item "${unfulfilledPhotos[0].element}" in area "${unfulfilledPhotos[0].area}" requires an inspection photo attachment`,
      );
    }

    // Atomic Transaction for Submission & ServiceRequest status sync
    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        surveyId: survey.id,
        currentStatus: SurveyStatus.DRAFT,
        targetStatus: SurveyStatus.SUBMITTED,
        expectedVersion: survey.version,
        actorUserId: userId,
        remarks: 'Technical survey inspection submitted by vendor',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [SURVEY_SUBMITTED] User: [${userId}] Survey: [${surveyId}]`);

    return {
      message: 'Survey technical inspection submitted successfully',
      result,
    };
  }

  /**
   * Vendor lists surveys created by them
   */
  async getVendorSurveys(userId: string, query: QuerySurveyDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SurveyWhereInput = {
      vendorId: vendor.id,
      ...(query.status && { status: query.status }),
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
      ...(query.search && {
        items: {
          some: {
            OR: [
              { observation: { contains: query.search.trim(), mode: 'insensitive' } },
              { area: { contains: query.search.trim(), mode: 'insensitive' } },
              { element: { contains: query.search.trim(), mode: 'insensitive' } },
            ],
          },
        },
      }),
    };

    const [total, surveys] = await Promise.all([
      this.prisma.survey.count({ where }),
      this.prisma.survey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          notes: true,
          startedAt: true,
          submittedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          _count: { select: { items: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'Vendor surveys retrieved successfully',
      data: surveys,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Vendor views single survey details enforcing ownership
   */
  async getVendorSurveyById(userId: string, surveyId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId },
      select: {
        id: true,
        serviceRequestId: true,
        vendorId: true,
        version: true,
        status: true,
        notes: true,
        startedAt: true,
        submittedAt: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true,
        serviceRequest: {
          select: {
            ticketNumber: true,
            title: true,
            description: true,
            address: { select: { label: true, addressLine1: true, city: true, state: true } },
          },
        },
        items: {
          select: {
            id: true,
            area: true,
            element: true,
            observation: true,
            actionRequired: true,
            severity: true,
            sortOrder: true,
            isMandatory: true,
            photoRequired: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        attachments: {
          select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true, surveyItemId: true },
        },
        comments: {
          select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.vendorId !== vendor.id) throw new ForbiddenException('You do not own this survey');

    return {
      message: 'Survey details retrieved successfully',
      survey,
    };
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin lists all platform surveys
   */
  async getAllSurveysAdmin(query: QuerySurveyDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SurveyWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.vendorId && { vendorId: query.vendorId }),
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
      ...(query.severity && {
        items: { some: { severity: query.severity } },
      }),
      ...(query.search && {
        OR: [
          { serviceRequest: { ticketNumber: { contains: query.search.trim(), mode: 'insensitive' } } },
          { items: { some: { observation: { contains: query.search.trim(), mode: 'insensitive' } } } },
        ],
      }),
    };

    const [total, surveys] = await Promise.all([
      this.prisma.survey.count({ where }),
      this.prisma.survey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          notes: true,
          submittedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          vendor: { select: { id: true, businessName: true } },
          _count: { select: { items: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'All surveys retrieved successfully',
      data: surveys,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin views comprehensive survey details
   */
  async getSurveyByIdAdmin(surveyId: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId },
      select: {
        id: true,
        serviceRequestId: true,
        version: true,
        status: true,
        notes: true,
        startedAt: true,
        submittedAt: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true,
        serviceRequest: {
          select: {
            ticketNumber: true,
            title: true,
            description: true,
            customer: { select: { firstName: true, lastName: true, companyName: true } },
            address: { select: { addressLine1: true, city: true, state: true } },
          },
        },
        vendor: { select: { id: true, businessName: true, companyName: true, averageRating: true } },
        items: {
          select: {
            id: true,
            area: true,
            element: true,
            observation: true,
            actionRequired: true,
            severity: true,
            sortOrder: true,
            isMandatory: true,
            photoRequired: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        attachments: {
          select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true, surveyItemId: true },
        },
        comments: {
          select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!survey) throw new NotFoundException('Survey not found');

    return {
      message: 'Survey details retrieved successfully',
      survey,
    };
  }

  /**
   * Admin reviews (Approves or Rejects) a submitted survey
   */
  async reviewSurveyAdmin(adminUserId: string, surveyId: string, dto: ReviewSurveyDto) {
    const { survey } = await this.getSurveyByIdAdmin(surveyId);

    if (survey.status !== SurveyStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot review survey in status ${survey.status}. Survey must be SUBMITTED.`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        surveyId: survey.id,
        currentStatus: SurveyStatus.SUBMITTED,
        targetStatus: dto.status,
        expectedVersion: survey.version,
        actorUserId: adminUserId,
        remarks: dto.remarks || `Survey ${dto.status.toLowerCase()} by Admin`,
      });
    });

    const auditEvent = dto.status === SurveyStatus.APPROVED ? 'SURVEY_APPROVED' : 'SURVEY_REJECTED';
    this.logger.log(`[AUDIT_EVENT] [${auditEvent}] Admin: [${adminUserId}] Survey: [${surveyId}]`);

    return {
      message: `Survey ${dto.status.toLowerCase()} successfully`,
      result,
    };
  }

  /**
   * Admin adds internal staff review comment to survey
   */
  async addSurveyCommentAdmin(adminUserId: string, surveyId: string, dto: AddSurveyCommentDto) {
    await this.getSurveyByIdAdmin(surveyId);

    const comment = await this.prisma.comment.create({
      data: {
        surveyId,
        userId: adminUserId,
        comment: dto.comment.trim(),
      },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: { select: { email: true, role: true } },
      },
    });

    this.logger.log(`[AUDIT_EVENT] [SURVEY_COMMENT_ADDED] Admin: [${adminUserId}] Survey: [${surveyId}]`);

    return {
      message: 'Survey comment added successfully',
      comment,
    };
  }

  // ==============================================================================
  // CUSTOMER OPERATIONS (READ-ONLY)
  // ==============================================================================

  /**
   * Customer lists SUBMITTED or APPROVED surveys for their own service requests
   */
  async getCustomerSurveys(userId: string, query: QuerySurveyDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SurveyWhereInput = {
      serviceRequest: { customerId: customer.id },
      status: { in: [SurveyStatus.SUBMITTED, SurveyStatus.APPROVED] },
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
    };

    const [total, surveys] = await Promise.all([
      this.prisma.survey.count({ where }),
      this.prisma.survey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          submittedAt: true,
          approvedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          vendor: { select: { businessName: true } },
          _count: { select: { items: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'Surveys retrieved successfully',
      data: surveys,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Customer views submitted/approved survey inspection details enforcing ownership
   */
  async getCustomerSurveyById(userId: string, surveyId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId },
      select: {
        id: true,
        serviceRequestId: true,
        version: true,
        status: true,
        notes: true,
        submittedAt: true,
        approvedAt: true,
        createdAt: true,
        serviceRequest: { select: { customerId: true, ticketNumber: true, title: true } },
        vendor: { select: { businessName: true } },
        items: {
          select: {
            id: true,
            area: true,
            element: true,
            observation: true,
            actionRequired: true,
            severity: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true } },
      },
    });

    if (!survey || survey.serviceRequest.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this survey');
    }

    if (survey.status === SurveyStatus.DRAFT) {
      throw new ForbiddenException('Customer access is restricted while survey is in DRAFT state');
    }

    return {
      message: 'Survey details retrieved successfully',
      survey,
    };
  }
}
