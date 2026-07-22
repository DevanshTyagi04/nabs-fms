import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, Prisma, RequestStatus, SurveyStatus } from '@prisma/client';
import { PrismaService } from '../prisma';
import { PricingCalculatorService } from './calculation/pricing-calculator.service';
import {
  AddEstimateCommentDto,
  CreateEstimateDto,
  CreateEstimateItemDto,
  QueryEstimateDto,
  RejectEstimateDto,
  UpdateEstimateDto,
  UpdateEstimateItemDto,
} from './dto';
import { EstimateStateService } from './state/estimate-state.service';

@Injectable()
export class EstimatesService {
  private readonly logger = new Logger(EstimatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: EstimateStateService,
    private readonly calculatorService: PricingCalculatorService,
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
      throw new ForbiddenException('Only vendors can access vendor estimate endpoints');
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
      throw new ForbiddenException('Only customers can access customer estimate endpoints');
    }

    return profile;
  }

  /**
   * Helper: Recalculates and updates overall Estimate totals inside transaction
   */
  private async recalculateAndUpdateEstimateTotals(
    tx: Prisma.TransactionClient,
    estimateId: string,
    overrideDiscount?: number | string | Prisma.Decimal,
  ) {
    const items = await tx.estimateItem.findMany({
      where: { estimateId },
      select: { quantity: true, unitPrice: true, taxRate: true, discount: true },
    });

    const currentEstimate = await tx.estimate.findUnique({
      where: { id: estimateId },
      select: { discountAmount: true },
    });

    const estDiscount = overrideDiscount !== undefined ? overrideDiscount : currentEstimate?.discountAmount || 0;
    const totals = this.calculatorService.calculateEstimateTotals(items, estDiscount);

    await tx.estimate.update({
      where: { id: estimateId },
      data: {
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
      },
    });

    return totals;
  }

  // ==============================================================================
  // VENDOR OPERATIONS
  // ==============================================================================

  /**
   * Vendor creates an Estimate Draft or Revised Version for an assigned Service Request
   */
  async createOrVersionEstimateVendor(userId: string, dto: CreateEstimateDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    // 1. Verify Service Request assignment & active status
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: dto.serviceRequestId },
      select: { id: true, assignedVendorId: true, status: true },
    });

    if (!request) throw new NotFoundException('Service request not found');
    if (request.assignedVendorId !== vendor.id) throw new ForbiddenException('You are not assigned to this service request');
    if (request.status === RequestStatus.CANCELLED) throw new BadRequestException('Cannot create estimate for a cancelled service request');

    // 2. Verify an APPROVED survey exists for this request (or surveyId is provided)
    if (dto.surveyId) {
      const survey = await this.prisma.survey.findUnique({
        where: { id: dto.surveyId },
        select: { id: true, status: true, serviceRequestId: true },
      });
      if (!survey || survey.serviceRequestId !== dto.serviceRequestId) {
        throw new BadRequestException('Selected survey does not belong to this service request');
      }
      if (survey.status !== SurveyStatus.APPROVED) {
        throw new BadRequestException(`Cannot generate estimate from unapproved survey (Status: ${survey.status})`);
      }
    } else {
      const approvedSurvey = await this.prisma.survey.findFirst({
        where: { serviceRequestId: dto.serviceRequestId, status: SurveyStatus.APPROVED },
      });
      if (!approvedSurvey) {
        throw new BadRequestException('An approved survey is required before creating an estimate quotation');
      }
      dto.surveyId = approvedSurvey.id;
    }

    // 3. Query existing estimates for this request
    const existingEstimates = await this.prisma.estimate.findMany({
      where: { serviceRequestId: dto.serviceRequestId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, status: true },
    });

    const activeDraft = existingEstimates.find((e) => e.status === EstimateStatus.DRAFT);
    if (activeDraft) {
      return {
        message: 'Active estimate draft already exists for this request',
        estimateId: activeDraft.id,
        version: activeDraft.version,
        status: activeDraft.status,
      };
    }

    const latestEstimate = existingEstimates[0];
    const newVersion = latestEstimate ? latestEstimate.version + 1 : 1;

    // 4. Atomic Transaction for Estimate creation and version superseding
    const estimate = await this.prisma.$transaction(async (tx) => {
      if (latestEstimate && (latestEstimate.status === EstimateStatus.PENDING_APPROVAL || latestEstimate.status === EstimateStatus.APPROVED || latestEstimate.status === EstimateStatus.REJECTED)) {
        await this.stateService.transitionStatus(tx, {
          estimateId: latestEstimate.id,
          currentStatus: latestEstimate.status,
          targetStatus: EstimateStatus.SUPERSEDED,
          expectedVersion: latestEstimate.version,
          actorUserId: userId,
          remarks: `Superseded by revised version ${newVersion}`,
        });
      }

      return tx.estimate.create({
        data: {
          serviceRequestId: dto.serviceRequestId,
          surveyId: dto.surveyId || null,
          version: newVersion,
          status: EstimateStatus.DRAFT,
          subtotal: new Prisma.Decimal('0.00'),
          taxAmount: new Prisma.Decimal('0.00'),
          discountAmount: this.calculatorService.toDecimal(dto.discountAmount, '0.00'),
          totalAmount: new Prisma.Decimal('0.00'),
          termsAndConditions: dto.termsAndConditions?.trim() || null,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        },
        select: {
          id: true,
          serviceRequestId: true,
          surveyId: true,
          version: true,
          status: true,
          subtotal: true,
          taxAmount: true,
          discountAmount: true,
          totalAmount: true,
          termsAndConditions: true,
          validUntil: true,
          createdAt: true,
        },
      });
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_CREATED] User: [${userId}] Estimate: [${estimate.id}] Version: [${estimate.version}]`);

    return {
      message: newVersion > 1 ? `Revised quotation version ${newVersion} created successfully` : 'Estimate quotation draft created successfully',
      estimate,
    };
  }

  /**
   * Vendor updates estimate draft terms, validUntil, or discount
   */
  async updateEstimateVendor(userId: string, estimateId: string, dto: UpdateEstimateDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const estimate = await this.prisma.estimate.findFirst({
      where: { id: estimateId },
      select: { id: true, status: true, serviceRequest: { select: { assignedVendorId: true } } },
    });

    if (!estimate) throw new NotFoundException('Estimate not found');
    if (estimate.serviceRequest.assignedVendorId !== vendor.id) throw new ForbiddenException('You do not own this estimate');
    if (estimate.status !== EstimateStatus.DRAFT) throw new BadRequestException(`Cannot edit estimate in status ${estimate.status}`);

    const updated = await this.prisma.$transaction(async (tx) => {
      const est = await tx.estimate.update({
        where: { id: estimateId },
        data: {
          ...(dto.termsAndConditions !== undefined && { termsAndConditions: dto.termsAndConditions?.trim() || null }),
          ...(dto.validUntil !== undefined && { validUntil: new Date(dto.validUntil) }),
          ...(dto.discountAmount !== undefined && { discountAmount: this.calculatorService.toDecimal(dto.discountAmount) }),
        },
      });

      await this.recalculateAndUpdateEstimateTotals(tx, estimateId, dto.discountAmount);
      return est;
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_UPDATED] User: [${userId}] Estimate: [${estimateId}]`);

    return {
      message: 'Estimate updated successfully',
      estimate: updated,
    };
  }

  /**
   * Vendor adds line item to Estimate draft (recalculates totals)
   */
  async createEstimateItemVendor(userId: string, estimateId: string, dto: CreateEstimateItemDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const estimate = await this.prisma.estimate.findFirst({
      where: { id: estimateId },
      select: { id: true, status: true, serviceRequest: { select: { assignedVendorId: true } } },
    });

    if (!estimate) throw new NotFoundException('Estimate not found');
    if (estimate.serviceRequest.assignedVendorId !== vendor.id) throw new ForbiddenException('You do not own this estimate');
    if (estimate.status !== EstimateStatus.DRAFT) throw new BadRequestException('Cannot add items to a submitted quotation');

    // Calculate line item totals strictly using PricingCalculatorService
    const calculatedLine = this.calculatorService.calculateLineItem({
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      taxRate: dto.taxRate,
      discount: dto.discount,
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const item = await tx.estimateItem.create({
        data: {
          estimateId,
          description: dto.description.trim(),
          quantity: this.calculatorService.toDecimal(dto.quantity),
          unitPrice: this.calculatorService.toDecimal(dto.unitPrice),
          taxRate: this.calculatorService.toDecimal(dto.taxRate, '0.00'),
          discount: this.calculatorService.toDecimal(dto.discount, '0.00'),
          total: calculatedLine.total,
        },
        select: {
          id: true,
          description: true,
          quantity: true,
          unitPrice: true,
          taxRate: true,
          discount: true,
          total: true,
          createdAt: true,
        },
      });

      await this.recalculateAndUpdateEstimateTotals(tx, estimateId);
      return item;
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_ITEM_CREATED] User: [${userId}] EstimateItem: [${result.id}]`);

    return {
      message: 'Estimate line item added successfully',
      item: result,
    };
  }

  /**
   * Vendor updates line item in Estimate draft (recalculates totals)
   */
  async updateEstimateItemVendor(userId: string, estimateId: string, itemId: string, dto: UpdateEstimateItemDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const item = await this.prisma.estimateItem.findFirst({
      where: { id: itemId, estimateId },
      select: { id: true, quantity: true, unitPrice: true, taxRate: true, discount: true, estimate: { select: { status: true, serviceRequest: { select: { assignedVendorId: true } } } } },
    });

    if (!item) throw new NotFoundException('Estimate item not found');
    if (item.estimate.serviceRequest.assignedVendorId !== vendor.id) throw new ForbiddenException('You do not own this estimate item');
    if (item.estimate.status !== EstimateStatus.DRAFT) throw new BadRequestException('Cannot update items on a submitted quotation');

    const newQty = dto.quantity !== undefined ? dto.quantity : item.quantity;
    const newPrice = dto.unitPrice !== undefined ? dto.unitPrice : item.unitPrice;
    const newTax = dto.taxRate !== undefined ? dto.taxRate : item.taxRate;
    const newDisc = dto.discount !== undefined ? dto.discount : item.discount;

    const calculatedLine = this.calculatorService.calculateLineItem({
      quantity: newQty,
      unitPrice: newPrice,
      taxRate: newTax,
      discount: newDisc,
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.estimateItem.update({
        where: { id: itemId },
        data: {
          ...(dto.description && { description: dto.description.trim() }),
          ...(dto.quantity !== undefined && { quantity: this.calculatorService.toDecimal(dto.quantity) }),
          ...(dto.unitPrice !== undefined && { unitPrice: this.calculatorService.toDecimal(dto.unitPrice) }),
          ...(dto.taxRate !== undefined && { taxRate: this.calculatorService.toDecimal(dto.taxRate) }),
          ...(dto.discount !== undefined && { discount: this.calculatorService.toDecimal(dto.discount) }),
          total: calculatedLine.total,
        },
        select: { id: true, description: true, quantity: true, unitPrice: true, taxRate: true, discount: true, total: true },
      });

      await this.recalculateAndUpdateEstimateTotals(tx, estimateId);
      return res;
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_ITEM_UPDATED] User: [${userId}] EstimateItem: [${itemId}]`);

    return {
      message: 'Estimate line item updated successfully',
      item: updated,
    };
  }

  /**
   * Vendor deletes line item from Estimate draft (recalculates totals)
   */
  async deleteEstimateItemVendor(userId: string, estimateId: string, itemId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const item = await this.prisma.estimateItem.findFirst({
      where: { id: itemId, estimateId },
      select: { id: true, estimate: { select: { status: true, serviceRequest: { select: { assignedVendorId: true } } } } },
    });

    if (!item) throw new NotFoundException('Estimate item not found');
    if (item.estimate.serviceRequest.assignedVendorId !== vendor.id) throw new ForbiddenException('You do not own this estimate item');
    if (item.estimate.status !== EstimateStatus.DRAFT) throw new BadRequestException('Cannot delete items from a submitted quotation');

    await this.prisma.$transaction(async (tx) => {
      await tx.estimateItem.delete({ where: { id: itemId } });
      await this.recalculateAndUpdateEstimateTotals(tx, estimateId);
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_ITEM_DELETED] User: [${userId}] EstimateItem: [${itemId}]`);

    return {
      message: 'Estimate line item deleted successfully',
    };
  }

  /**
   * Vendor submits quotation estimate for customer approval
   */
  async submitEstimateVendor(userId: string, estimateId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const estimate = await this.prisma.estimate.findFirst({
      where: { id: estimateId },
      select: {
        id: true,
        status: true,
        version: true,
        totalAmount: true,
        serviceRequest: { select: { assignedVendorId: true } },
        items: { select: { id: true, quantity: true, unitPrice: true } },
      },
    });

    if (!estimate) throw new NotFoundException('Estimate not found');
    if (estimate.serviceRequest.assignedVendorId !== vendor.id) throw new ForbiddenException('You do not own this estimate');
    if (estimate.status !== EstimateStatus.DRAFT) throw new BadRequestException(`Estimate is already submitted or reviewed (Status: ${estimate.status})`);

    // Submission Validations
    if (estimate.items.length === 0) {
      throw new UnprocessableEntityException('Cannot submit estimate quotation without at least one line item');
    }

    if (estimate.totalAmount.lte(0)) {
      throw new UnprocessableEntityException('Cannot submit estimate quotation with zero or negative total amount');
    }

    // Atomic Transaction for Submission & State Machine Transition
    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        estimateId: estimate.id,
        currentStatus: EstimateStatus.DRAFT,
        targetStatus: EstimateStatus.PENDING_APPROVAL,
        expectedVersion: estimate.version,
        actorUserId: userId,
        remarks: 'Quotation estimate submitted to customer for approval',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_SUBMITTED] User: [${userId}] Estimate: [${estimateId}]`);

    return {
      message: 'Estimate quotation submitted to customer successfully',
      result,
    };
  }

  /**
   * Vendor lists estimates created by them
   */
  async getVendorEstimates(userId: string, query: QueryEstimateDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EstimateWhereInput = {
      serviceRequest: { assignedVendorId: vendor.id },
      ...(query.status && { status: query.status }),
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
      ...(query.search && {
        items: {
          some: { description: { contains: query.search.trim(), mode: 'insensitive' } },
        },
      }),
    };

    const [total, estimates] = await Promise.all([
      this.prisma.estimate.count({ where }),
      this.prisma.estimate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          subtotal: true,
          taxAmount: true,
          discountAmount: true,
          totalAmount: true,
          validUntil: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          _count: { select: { items: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'Vendor estimates retrieved successfully',
      data: estimates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Vendor views single estimate details enforcing ownership
   */
  async getVendorEstimateById(userId: string, estimateId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const estimate = await this.prisma.estimate.findFirst({
      where: { id: estimateId },
      select: {
        id: true,
        serviceRequestId: true,
        surveyId: true,
        version: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        discountAmount: true,
        totalAmount: true,
        termsAndConditions: true,
        validUntil: true,
        approvedAt: true,
        rejectedAt: true,
        createdAt: true,
        updatedAt: true,
        serviceRequest: {
          select: {
            ticketNumber: true,
            title: true,
            assignedVendorId: true,
            address: { select: { label: true, city: true, state: true } },
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            taxRate: true,
            discount: true,
            total: true,
          },
        },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true } },
        comments: {
          select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!estimate) throw new NotFoundException('Estimate not found');
    if (estimate.serviceRequest.assignedVendorId !== vendor.id) throw new ForbiddenException('You do not own this estimate');

    return {
      message: 'Estimate details retrieved successfully',
      estimate,
    };
  }

  // ==============================================================================
  // CUSTOMER OPERATIONS
  // ==============================================================================

  /**
   * Customer lists submitted/approved/rejected estimates for their own requests
   */
  async getCustomerEstimates(userId: string, query: QueryEstimateDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EstimateWhereInput = {
      serviceRequest: { customerId: customer.id },
      status: { in: [EstimateStatus.PENDING_APPROVAL, EstimateStatus.APPROVED, EstimateStatus.REJECTED] },
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
    };

    const [total, estimates] = await Promise.all([
      this.prisma.estimate.count({ where }),
      this.prisma.estimate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          subtotal: true,
          taxAmount: true,
          discountAmount: true,
          totalAmount: true,
          validUntil: true,
          approvedAt: true,
          rejectedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      message: 'Customer estimates retrieved successfully',
      data: estimates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Customer views quotation details enforcing ownership & non-draft status
   */
  async getCustomerEstimateById(userId: string, estimateId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const estimate = await this.prisma.estimate.findFirst({
      where: { id: estimateId },
      select: {
        id: true,
        serviceRequestId: true,
        version: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        discountAmount: true,
        totalAmount: true,
        termsAndConditions: true,
        validUntil: true,
        approvedAt: true,
        rejectedAt: true,
        createdAt: true,
        serviceRequest: { select: { customerId: true, ticketNumber: true, title: true } },
        items: {
          select: { id: true, description: true, quantity: true, unitPrice: true, taxRate: true, discount: true, total: true },
        },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true } },
      },
    });

    if (!estimate || estimate.serviceRequest.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this estimate');
    }

    if (estimate.status === EstimateStatus.DRAFT) {
      throw new ForbiddenException('Customer access is restricted while estimate is in DRAFT state');
    }

    return {
      message: 'Estimate quotation details retrieved successfully',
      estimate,
    };
  }

  /**
   * Customer approves quotation estimate
   */
  async approveEstimateCustomer(userId: string, estimateId: string) {
    const { estimate } = await this.getCustomerEstimateById(userId, estimateId);

    if (estimate.status !== EstimateStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Cannot approve estimate in status ${estimate.status}`);
    }

    if (estimate.validUntil && new Date(estimate.validUntil) < new Date()) {
      throw new UnprocessableEntityException('This quotation estimate has expired and can no longer be approved');
    }

    const currentEst = await this.prisma.estimate.findUnique({
      where: { id: estimateId },
      select: { version: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        estimateId: estimate.id,
        currentStatus: EstimateStatus.PENDING_APPROVAL,
        targetStatus: EstimateStatus.APPROVED,
        expectedVersion: currentEst!.version,
        actorUserId: userId,
        remarks: 'Quotation approved by customer',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_APPROVED] Customer: [${userId}] Estimate: [${estimateId}]`);

    return {
      message: 'Quotation estimate approved successfully',
      result,
    };
  }

  /**
   * Customer rejects quotation estimate with remarks
   */
  async rejectEstimateCustomer(userId: string, estimateId: string, dto?: RejectEstimateDto) {
    const { estimate } = await this.getCustomerEstimateById(userId, estimateId);

    if (estimate.status !== EstimateStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Cannot reject estimate in status ${estimate.status}`);
    }

    const currentEst = await this.prisma.estimate.findUnique({
      where: { id: estimateId },
      select: { version: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        estimateId: estimate.id,
        currentStatus: EstimateStatus.PENDING_APPROVAL,
        targetStatus: EstimateStatus.REJECTED,
        expectedVersion: currentEst!.version,
        actorUserId: userId,
        remarks: dto?.remarks || 'Quotation rejected by customer',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_REJECTED] Customer: [${userId}] Estimate: [${estimateId}]`);

    return {
      message: 'Quotation estimate rejected',
      result,
    };
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin views all platform estimate quotations
   */
  async getAllEstimatesAdmin(query: QueryEstimateDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EstimateWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
      ...(query.vendorId && { serviceRequest: { assignedVendorId: query.vendorId } }),
      ...(query.search && {
        OR: [
          { serviceRequest: { ticketNumber: { contains: query.search.trim(), mode: 'insensitive' } } },
          { items: { some: { description: { contains: query.search.trim(), mode: 'insensitive' } } } },
        ],
      }),
    };

    const [total, estimates] = await Promise.all([
      this.prisma.estimate.count({ where }),
      this.prisma.estimate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          version: true,
          status: true,
          subtotal: true,
          taxAmount: true,
          discountAmount: true,
          totalAmount: true,
          validUntil: true,
          createdAt: true,
          serviceRequest: {
            select: {
              ticketNumber: true,
              title: true,
              customer: { select: { firstName: true, lastName: true } },
              assignedVendor: { select: { businessName: true } },
            },
          },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      message: 'All estimates retrieved successfully',
      data: estimates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin views comprehensive estimate details
   */
  async getEstimateByIdAdmin(estimateId: string) {
    const estimate = await this.prisma.estimate.findFirst({
      where: { id: estimateId },
      select: {
        id: true,
        serviceRequestId: true,
        surveyId: true,
        version: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        discountAmount: true,
        totalAmount: true,
        termsAndConditions: true,
        validUntil: true,
        approvedAt: true,
        rejectedAt: true,
        createdAt: true,
        updatedAt: true,
        serviceRequest: {
          select: {
            ticketNumber: true,
            title: true,
            description: true,
            customer: { select: { firstName: true, lastName: true, companyName: true } },
            assignedVendor: { select: { id: true, businessName: true } },
          },
        },
        items: {
          select: { id: true, description: true, quantity: true, unitPrice: true, taxRate: true, discount: true, total: true },
        },
        comments: {
          select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true } },
      },
    });

    if (!estimate) throw new NotFoundException('Estimate not found');

    return {
      message: 'Estimate details retrieved successfully',
      estimate,
    };
  }

  /**
   * Admin adds internal staff comment to estimate
   */
  async addEstimateCommentAdmin(adminUserId: string, estimateId: string, dto: AddEstimateCommentDto) {
    await this.getEstimateByIdAdmin(estimateId);

    const comment = await this.prisma.comment.create({
      data: {
        estimateId,
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

    this.logger.log(`[AUDIT_EVENT] [ESTIMATE_COMMENT_ADDED] Admin: [${adminUserId}] Estimate: [${estimateId}]`);

    return {
      message: 'Estimate comment added successfully',
      comment,
    };
  }
}
