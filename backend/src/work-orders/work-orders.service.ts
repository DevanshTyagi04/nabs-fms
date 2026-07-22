import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, Prisma, RequestStatus, TaskStatus, WorkOrderStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma';
import { RequestStateService } from '../service-requests/state-machine/request-state.service';
import { CreateWorkOrderDto, PauseWorkOrderDto, QueryWorkOrderDto, UpdateWorkOrderDto } from './dto';
import { WorkOrderStateService } from './state/work-order-state.service';

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: WorkOrderStateService,
    private readonly requestStateService: RequestStateService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Helper: Generates a collision-safe work order number (WO-YYYYMMDD-XXXX)
   */
  private generateWorkOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
    return `WO-${dateStr}-${randomSuffix}`;
  }

  /**
   * Helper: Resolves VendorProfile ID or throws ForbiddenException
   */
  private async getVendorProfileOrThrow(userId: string) {
    const profile = await this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true, businessName: true },
    });

    if (!profile) {
      throw new ForbiddenException('Only vendors can access vendor work order endpoints');
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
      throw new ForbiddenException('Only customers can access customer work order endpoints');
    }

    return profile;
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin creates a Work Order from an APPROVED estimate quotation
   */
  async createWorkOrderAdmin(adminUserId: string, dto: CreateWorkOrderDto) {
    // 1. Verify Estimate exists and is APPROVED
    const estimate = await this.prisma.estimate.findUnique({
      where: { id: dto.estimateId },
      select: {
        id: true,
        status: true,
        serviceRequestId: true,
        serviceRequest: { select: { id: true, status: true, version: true, assignedVendorId: true } },
      },
    });

    if (!estimate) throw new NotFoundException('Estimate quotation not found');
    if (estimate.status !== EstimateStatus.APPROVED) {
      throw new BadRequestException(`Cannot create Work Order from unapproved estimate (Current Status: ${estimate.status})`);
    }

    if (!estimate.serviceRequest.assignedVendorId) {
      throw new BadRequestException('Service request has no vendor assigned');
    }

    // 2. Verify no active Work Order exists for this service request
    const activeWo = await this.prisma.workOrder.findFirst({
      where: {
        serviceRequestId: estimate.serviceRequestId,
        status: { not: WorkOrderStatus.CANCELLED },
      },
    });

    if (activeWo) {
      throw new BadRequestException(`An active Work Order (${activeWo.workOrderNumber}) already exists for this request`);
    }

    // 3. Collision-safe WO number generation and transaction
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const workOrderNumber = this.generateWorkOrderNumber();

        const workOrder = await this.prisma.$transaction(async (tx) => {
          const newWo = await tx.workOrder.create({
            data: {
              workOrderNumber,
              serviceRequestId: estimate.serviceRequestId,
              estimateId: dto.estimateId,
              assignedVendorId: estimate.serviceRequest.assignedVendorId!,
              status: WorkOrderStatus.ASSIGNED,
              scheduledStart: new Date(dto.scheduledStart),
              scheduledEnd: new Date(dto.scheduledEnd),
              estimatedDuration: dto.estimatedDuration || null,
              version: 1,
            },
            select: {
              id: true,
              workOrderNumber: true,
              serviceRequestId: true,
              estimateId: true,
              assignedVendorId: true,
              status: true,
              scheduledStart: true,
              scheduledEnd: true,
              createdAt: true,
            },
          });

          await tx.workStatusHistory.create({
            data: {
              workOrderId: newWo.id,
              fromStatus: null,
              toStatus: WorkOrderStatus.ASSIGNED,
              changedById: adminUserId,
              reason: 'Work Order initialized from approved estimate',
            },
          });

          await tx.workTimeline.create({
            data: {
              workOrderId: newWo.id,
              eventTitle: 'WORK_ORDER_CREATED',
              eventDescription: `Work Order ${newWo.workOrderNumber} created by Admin`,
              actorId: adminUserId,
            },
          });

          // Transition ServiceRequest status strictly via public RequestStateService interface
          await this.requestStateService.transitionStatus(tx, {
            requestId: estimate.serviceRequestId,
            currentStatus: estimate.serviceRequest.status,
            targetStatus: RequestStatus.SCHEDULED,
            expectedVersion: estimate.serviceRequest.version,
            actorUserId: adminUserId,
            remarks: 'Work Order created and scheduled by Admin',
          });

          return newWo;
        });

        // 4. Emit domain event strictly post-transaction
        this.eventEmitter.emit('WORK_ORDER_CREATED', { workOrderId: workOrder.id, actorId: adminUserId });
        this.logger.log(`[AUDIT_EVENT] [WORK_ORDER_CREATED] Admin: [${adminUserId}] WO: [${workOrder.workOrderNumber}]`);

        return {
          message: 'Work Order created successfully',
          workOrder,
        };
      } catch (error) {
        if (attempts >= maxAttempts) throw error;
      }
    }

    throw new BadRequestException('Failed to generate unique Work Order number. Please try again.');
  }

  /**
   * Admin lists all platform Work Orders
   */
  async getAllWorkOrdersAdmin(query: QueryWorkOrderDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkOrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
      ...(query.vendorId && { assignedVendorId: query.vendorId }),
      ...(query.search && {
        OR: [
          { workOrderNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { serviceRequest: { title: { contains: query.search.trim(), mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, workOrders] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          workOrderNumber: true,
          status: true,
          scheduledStart: true,
          scheduledEnd: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          assignedVendor: { select: { id: true, businessName: true } },
          _count: { select: { tasks: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'All Work Orders retrieved successfully',
      data: workOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin views comprehensive Work Order details
   */
  async getWorkOrderByIdAdmin(workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
      select: {
        id: true,
        workOrderNumber: true,
        serviceRequestId: true,
        estimateId: true,
        assignedVendorId: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        estimatedDuration: true,
        actualStartTime: true,
        actualEndTime: true,
        startedAt: true,
        completedAt: true,
        version: true,
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
        assignedVendor: { select: { id: true, businessName: true, companyName: true, averageRating: true } },
        estimate: { select: { id: true, totalAmount: true, status: true } },
        tasks: {
          select: { id: true, description: true, remarks: true, sequenceNumber: true, estimatedHours: true, actualHours: true, status: true, completedAt: true },
          orderBy: { sequenceNumber: 'asc' },
        },
        timelineEvents: {
          select: { id: true, eventTitle: true, eventDescription: true, timestamp: true, actor: { select: { email: true, role: true } } },
          orderBy: { timestamp: 'asc' },
        },
        statusHistory: {
          select: { id: true, fromStatus: true, toStatus: true, reason: true, changedAt: true, changedBy: { select: { email: true, role: true } } },
          orderBy: { changedAt: 'asc' },
        },
        comments: {
          select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true } },
      },
    });

    if (!workOrder) throw new NotFoundException('Work Order not found');

    return {
      message: 'Work Order details retrieved successfully',
      workOrder,
    };
  }

  /**
   * Admin verifies completed Work Order (COMPLETED -> VERIFIED milestone event)
   */
  async verifyWorkOrderAdmin(adminUserId: string, workOrderId: string, remarks?: string) {
    const { workOrder } = await this.getWorkOrderByIdAdmin(workOrderId);

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException(`Cannot verify Work Order in status ${workOrder.status}. Work Order must be COMPLETED.`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        workOrderId: workOrder.id,
        currentStatus: WorkOrderStatus.COMPLETED,
        targetStatus: WorkOrderStatus.COMPLETED,
        expectedVersion: workOrder.version,
        actorUserId: adminUserId,
        reason: remarks || 'Work completion verified by Admin QA inspection',
        eventTitle: 'WORK_VERIFIED',
        eventDescription: remarks || 'QA inspection verified and approved for invoice processing',
      });
    });

    // Emit domain event strictly post-transaction
    this.eventEmitter.emit('WORK_VERIFIED', { workOrderId, actorId: adminUserId });
    this.logger.log(`[AUDIT_EVENT] [WORK_VERIFIED] Admin: [${adminUserId}] WO: [${workOrderId}]`);

    return {
      message: 'Work Order completion verified successfully',
      result,
    };
  }

  /**
   * Admin cancels Work Order
   */
  async cancelWorkOrderAdmin(adminUserId: string, workOrderId: string, reason?: string) {
    const { workOrder } = await this.getWorkOrderByIdAdmin(workOrderId);

    if (workOrder.status === WorkOrderStatus.COMPLETED || workOrder.status === WorkOrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot cancel Work Order in status ${workOrder.status}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        workOrderId: workOrder.id,
        currentStatus: workOrder.status,
        targetStatus: WorkOrderStatus.CANCELLED,
        expectedVersion: workOrder.version,
        actorUserId: adminUserId,
        reason: reason || 'Work Order cancelled by Admin',
        eventTitle: 'WORK_CANCELLED',
        eventDescription: reason || 'Work Order cancelled by Admin',
      });
    });

    this.eventEmitter.emit('WORK_CANCELLED', { workOrderId, actorId: adminUserId });
    this.logger.log(`[AUDIT_EVENT] [WORK_CANCELLED] Admin: [${adminUserId}] WO: [${workOrderId}]`);

    return {
      message: 'Work Order cancelled successfully',
      result,
    };
  }

  // ==============================================================================
  // VENDOR OPERATIONS
  // ==============================================================================

  /**
   * Vendor lists Work Orders assigned to them
   */
  async getVendorWorkOrders(userId: string, query: QueryWorkOrderDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkOrderWhereInput = {
      assignedVendorId: vendor.id,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { workOrderNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { serviceRequest: { title: { contains: query.search.trim(), mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, workOrders] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          workOrderNumber: true,
          status: true,
          scheduledStart: true,
          scheduledEnd: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          _count: { select: { tasks: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'Assigned Work Orders retrieved successfully',
      data: workOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Vendor views assigned Work Order details enforcing ownership
   */
  async getVendorWorkOrderById(userId: string, workOrderId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
      select: {
        id: true,
        workOrderNumber: true,
        assignedVendorId: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        estimatedDuration: true,
        actualStartTime: true,
        actualEndTime: true,
        startedAt: true,
        completedAt: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        serviceRequest: {
          select: {
            ticketNumber: true,
            title: true,
            description: true,
            address: { select: { label: true, addressLine1: true, city: true, state: true, postalCode: true } },
          },
        },
        tasks: {
          select: { id: true, description: true, remarks: true, sequenceNumber: true, estimatedHours: true, actualHours: true, status: true, completedAt: true },
          orderBy: { sequenceNumber: 'asc' },
        },
        timelineEvents: {
          select: { id: true, eventTitle: true, eventDescription: true, timestamp: true, actor: { select: { email: true, role: true } } },
          orderBy: { timestamp: 'asc' },
        },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true } },
      },
    });

    if (!workOrder) throw new NotFoundException('Work Order not found');
    if (workOrder.assignedVendorId !== vendor.id) throw new ForbiddenException('You are not assigned to this Work Order');

    return {
      message: 'Work Order details retrieved successfully',
      workOrder,
    };
  }

  /**
   * Vendor starts work on Work Order (ASSIGNED/SCHEDULED -> IN_PROGRESS)
   */
  async startWorkVendor(userId: string, workOrderId: string) {
    const { workOrder } = await this.getVendorWorkOrderById(userId, workOrderId);

    if (workOrder.status !== WorkOrderStatus.ASSIGNED && workOrder.status !== WorkOrderStatus.SCHEDULED) {
      throw new BadRequestException(`Cannot start work on Work Order in status ${workOrder.status}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        workOrderId: workOrder.id,
        currentStatus: workOrder.status,
        targetStatus: WorkOrderStatus.IN_PROGRESS,
        expectedVersion: workOrder.version,
        actorUserId: userId,
        reason: 'Work started by assigned vendor',
        eventTitle: 'WORK_STARTED',
        eventDescription: 'Technician arrived on site and commenced work execution',
      });
    });

    this.eventEmitter.emit('WORK_STARTED', { workOrderId, actorId: userId });
    this.logger.log(`[AUDIT_EVENT] [WORK_STARTED] Vendor: [${userId}] WO: [${workOrderId}]`);

    return {
      message: 'Work started successfully',
      result,
    };
  }

  /**
   * Vendor pauses work on Work Order (IN_PROGRESS -> ON_HOLD)
   */
  async pauseWorkVendor(userId: string, workOrderId: string, dto: PauseWorkOrderDto) {
    const { workOrder } = await this.getVendorWorkOrderById(userId, workOrderId);

    if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot pause Work Order in status ${workOrder.status}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        workOrderId: workOrder.id,
        currentStatus: WorkOrderStatus.IN_PROGRESS,
        targetStatus: WorkOrderStatus.ON_HOLD,
        expectedVersion: workOrder.version,
        actorUserId: userId,
        reason: dto.reason,
        eventTitle: 'WORK_PAUSED',
        eventDescription: `Work put on hold: ${dto.reason}`,
      });
    });

    this.eventEmitter.emit('WORK_PAUSED', { workOrderId, actorId: userId });
    this.logger.log(`[AUDIT_EVENT] [WORK_PAUSED] Vendor: [${userId}] WO: [${workOrderId}]`);

    return {
      message: 'Work paused successfully',
      result,
    };
  }

  /**
   * Vendor resumes paused work on Work Order (ON_HOLD -> IN_PROGRESS)
   */
  async resumeWorkVendor(userId: string, workOrderId: string) {
    const { workOrder } = await this.getVendorWorkOrderById(userId, workOrderId);

    if (workOrder.status !== WorkOrderStatus.ON_HOLD) {
      throw new BadRequestException(`Cannot resume Work Order in status ${workOrder.status}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        workOrderId: workOrder.id,
        currentStatus: WorkOrderStatus.ON_HOLD,
        targetStatus: WorkOrderStatus.IN_PROGRESS,
        expectedVersion: workOrder.version,
        actorUserId: userId,
        reason: 'Work resumed by vendor',
        eventTitle: 'WORK_RESUMED',
        eventDescription: 'Work execution resumed after pause',
      });
    });

    this.eventEmitter.emit('WORK_RESUMED', { workOrderId, actorId: userId });
    this.logger.log(`[AUDIT_EVENT] [WORK_RESUMED] Vendor: [${userId}] WO: [${workOrderId}]`);

    return {
      message: 'Work resumed successfully',
      result,
    };
  }

  /**
   * Vendor marks Work Order COMPLETED (executes completion validations)
   */
  async completeWorkVendor(userId: string, workOrderId: string) {
    const { workOrder } = await this.getVendorWorkOrderById(userId, workOrderId);

    if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot complete Work Order in status ${workOrder.status}`);
    }

    // Work Completion Validation Rules (User Recommendation 2)
    const inProgressTasks = workOrder.tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
    if (inProgressTasks.length > 0) {
      throw new UnprocessableEntityException(`Completion blocked: Task "${inProgressTasks[0].description}" is still in progress`);
    }

    const uncompletedTasks = workOrder.tasks.filter((t) => t.status !== TaskStatus.COMPLETED);
    if (uncompletedTasks.length > 0) {
      throw new UnprocessableEntityException(`Completion blocked: ${uncompletedTasks.length} checklist task(s) are not completed`);
    }

    if (workOrder.attachments.length === 0) {
      throw new UnprocessableEntityException('Completion blocked: At least one completion photo attachment is required');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        workOrderId: workOrder.id,
        currentStatus: WorkOrderStatus.IN_PROGRESS,
        targetStatus: WorkOrderStatus.COMPLETED,
        expectedVersion: workOrder.version,
        actorUserId: userId,
        reason: 'Work completed by vendor',
        eventTitle: 'WORK_COMPLETED',
        eventDescription: 'Technician completed all execution tasks and uploaded completion photos',
      });
    });

    this.eventEmitter.emit('WORK_COMPLETED', { workOrderId, actorId: userId });
    this.logger.log(`[AUDIT_EVENT] [WORK_COMPLETED] Vendor: [${userId}] WO: [${workOrderId}]`);

    return {
      message: 'Work Order marked completed successfully',
      result,
    };
  }

  // ==============================================================================
  // CUSTOMER OPERATIONS (READ-ONLY)
  // ==============================================================================

  /**
   * Customer lists Work Orders for their own service requests
   */
  async getCustomerWorkOrders(userId: string, query: QueryWorkOrderDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkOrderWhereInput = {
      serviceRequest: { customerId: customer.id },
      ...(query.status && { status: query.status }),
    };

    const [total, workOrders] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          workOrderNumber: true,
          status: true,
          scheduledStart: true,
          scheduledEnd: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          assignedVendor: { select: { businessName: true } },
          _count: { select: { tasks: true, attachments: true } },
        },
      }),
    ]);

    return {
      message: 'Customer Work Orders retrieved successfully',
      data: workOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Customer views Work Order progress details enforcing ownership
   */
  async getCustomerWorkOrderById(userId: string, workOrderId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
      select: {
        id: true,
        workOrderNumber: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        serviceRequest: { select: { customerId: true, ticketNumber: true, title: true } },
        assignedVendor: { select: { businessName: true } },
        tasks: { select: { id: true, description: true, status: true, completedAt: true } },
        timelineEvents: { select: { id: true, eventTitle: true, eventDescription: true, timestamp: true } },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true } },
      },
    });

    if (!workOrder || workOrder.serviceRequest.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this Work Order');
    }

    return {
      message: 'Work Order details retrieved successfully',
      workOrder,
    };
  }
}
