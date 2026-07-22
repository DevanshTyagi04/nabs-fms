import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Priority, RequestSource, RequestStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma';
import { VendorAssignmentService } from './assignment/vendor-assignment.service';
import {
  AddInternalNoteDto,
  AssignVendorDto,
  ChangeStatusDto,
  CreateServiceRequestDto,
  QueryServiceRequestDto,
  UpdateServiceRequestDto,
  VendorResponseDto,
} from './dto';
import { RequestStateService } from './state-machine/request-state.service';

@Injectable()
export class ServiceRequestService {
  private readonly logger = new Logger(ServiceRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: RequestStateService,
    private readonly assignmentService: VendorAssignmentService,
  ) {}

  /**
   * Helper: Generates a collision-safe ticket number (SR-YYYYMMDD-XXXX)
   */
  private generateTicketNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
    return `SR-${dateStr}-${randomSuffix}`;
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
      throw new ForbiddenException('Only customers can access customer service request endpoints');
    }

    return profile;
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
      throw new ForbiddenException('Only vendors can access vendor service request endpoints');
    }

    return profile;
  }

  // ==============================================================================
  // CUSTOMER OPERATIONS
  // ==============================================================================

  /**
   * Customer creates a new Service Request (atomically generates ticket & records CREATED history)
   */
  async createRequestCustomer(userId: string, dto: CreateServiceRequestDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    // 1. Verify Address belongs to Customer and is active
    const address = await this.prisma.address.findFirst({
      where: {
        id: dto.addressId,
        customerId: customer.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!address) {
      throw new BadRequestException('Selected address does not exist or is inactive');
    }

    // 2. Verify ServiceCategory exists and is active
    const category = await this.prisma.serviceCategory.findFirst({
      where: {
        id: dto.serviceCategoryId,
        deletedAt: null,
        isActive: true,
      },
      select: { id: true, name: true },
    });

    if (!category) {
      throw new BadRequestException('Selected service category does not exist or is inactive');
    }

    // 3. Collision-safe ticket generation and creation inside Prisma transaction
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const ticketNumber = this.generateTicketNumber();

        const request = await this.prisma.$transaction(async (tx) => {
          const newReq = await tx.serviceRequest.create({
            data: {
              ticketNumber,
              customerId: customer.id,
              addressId: dto.addressId,
              serviceCategoryId: dto.serviceCategoryId,
              title: dto.title.trim(),
              description: dto.description.trim(),
              priority: dto.priority || Priority.MEDIUM,
              source: dto.source || RequestSource.ONE_TIME,
              preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
              amcSubscriptionId: dto.amcSubscriptionId || null,
              status: RequestStatus.CREATED,
              version: 1,
            },
            select: {
              id: true,
              ticketNumber: true,
              title: true,
              description: true,
              priority: true,
              status: true,
              preferredDate: true,
              createdAt: true,
            },
          });

          await tx.serviceRequestHistory.create({
            data: {
              serviceRequestId: newReq.id,
              fromStatus: null,
              toStatus: RequestStatus.CREATED,
              changedById: userId,
              remarks: 'Service request created by customer',
            },
          });

          return newReq;
        });

        this.logger.log(
          `[AUDIT_EVENT] [SERVICE_REQUEST_CREATED] User: [${userId}] Ticket: [${request.ticketNumber}]`,
        );

        return {
          message: 'Service request created successfully',
          request,
        };
      } catch (error) {
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    throw new BadRequestException('Failed to generate a unique ticket number. Please try again.');
  }

  /**
   * Lists Customer's own service requests with search, filter, and pagination
   */
  async getCustomerRequests(userId: string, query: QueryServiceRequestDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceRequestWhereInput = {
      customerId: customer.id,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.serviceCategoryId && { serviceCategoryId: query.serviceCategoryId }),
      ...(query.search && {
        OR: [
          { ticketNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { title: { contains: query.search.trim(), mode: 'insensitive' } },
          { description: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, requests] = await Promise.all([
      this.prisma.serviceRequest.count({ where }),
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          preferredDate: true,
          createdAt: true,
          serviceCategory: { select: { id: true, name: true, icon: true, color: true } },
          address: { select: { id: true, label: true, city: true, state: true } },
          assignedVendor: { select: { id: true, businessName: true } },
        },
      }),
    ]);

    return {
      message: 'My service requests retrieved successfully',
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single request details enforcing Customer ownership
   */
  async getCustomerRequestById(userId: string, requestId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        ticketNumber: true,
        customerId: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        preferredDate: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        serviceCategory: { select: { id: true, name: true, icon: true, color: true } },
        address: { select: { id: true, label: true, addressLine1: true, city: true, state: true, postalCode: true } },
        assignedVendor: { select: { id: true, businessName: true, averageRating: true } },
        statusHistory: {
          select: { id: true, fromStatus: true, toStatus: true, remarks: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this service request');
    }

    return {
      message: 'Service request details retrieved successfully',
      request,
    };
  }

  /**
   * Customer cancels service request before work starts
   */
  async cancelCustomerRequest(userId: string, requestId: string, remarks?: string) {
    const { request } = await this.getCustomerRequestById(userId, requestId);

    if (request.status === RequestStatus.CANCELLED) {
      throw new BadRequestException('Service request is already cancelled');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        requestId: request.id,
        currentStatus: request.status,
        targetStatus: RequestStatus.CANCELLED,
        expectedVersion: request.version,
        actorUserId: userId,
        remarks: remarks || 'Cancelled by customer',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [SERVICE_REQUEST_CANCELLED] User: [${userId}] Request: [${requestId}]`);

    return {
      message: 'Service request cancelled successfully',
      result,
    };
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin views all platform service requests with search, filter, and pagination
   */
  async getAllRequestsAdmin(query: QueryServiceRequestDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceRequestWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.serviceCategoryId && { serviceCategoryId: query.serviceCategoryId }),
      ...(query.vendorId && { assignedVendorId: query.vendorId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.startDate && query.endDate && {
        createdAt: {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        },
      }),
      ...(query.search && {
        OR: [
          { ticketNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { title: { contains: query.search.trim(), mode: 'insensitive' } },
          { description: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, requests] = await Promise.all([
      this.prisma.serviceRequest.count({ where }),
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          priority: true,
          status: true,
          preferredDate: true,
          version: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: { select: { email: true, phone: true } },
            },
          },
          serviceCategory: { select: { id: true, name: true } },
          assignedVendor: { select: { id: true, businessName: true } },
        },
      }),
    ]);

    return {
      message: 'All service requests retrieved successfully',
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin views comprehensive request details
   */
  async getRequestByIdAdmin(requestId: string) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        source: true,
        preferredDate: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            user: { select: { id: true, email: true, phone: true } },
          },
        },
        address: {
          select: {
            id: true,
            label: true,
            addressLine1: true,
            addressLine2: true,
            landmark: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
        serviceCategory: { select: { id: true, name: true, description: true } },
        assignedVendor: {
          select: {
            id: true,
            businessName: true,
            companyName: true,
            verificationStatus: true,
            availabilityStatus: true,
            averageRating: true,
          },
        },
        statusHistory: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            remarks: true,
            createdAt: true,
            changedBy: { select: { id: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return {
      message: 'Service request details retrieved successfully',
      request,
    };
  }

  /**
   * Admin assigns or reassigns a Vendor to a Service Request
   */
  async assignVendorAdmin(adminUserId: string, requestId: string, dto: AssignVendorDto) {
    const { request } = await this.getRequestByIdAdmin(requestId);

    // Validate Vendor Eligibility
    await this.assignmentService.validateVendorEligibility(dto.vendorId, request.serviceCategory.id);

    const isReassignment = !!request.assignedVendor;
    const targetStatus = RequestStatus.ASSIGNED;

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        requestId: request.id,
        currentStatus: request.status,
        targetStatus,
        expectedVersion: request.version,
        actorUserId: adminUserId,
        assignedVendorId: dto.vendorId,
        remarks: dto.remarks || (isReassignment ? 'Vendor reassigned by Admin' : 'Vendor assigned by Admin'),
      });
    });

    const auditAction = isReassignment ? 'SERVICE_REQUEST_REASSIGNED' : 'SERVICE_REQUEST_ASSIGNED';
    this.logger.log(`[AUDIT_EVENT] [${auditAction}] Admin: [${adminUserId}] Request: [${requestId}] Vendor: [${dto.vendorId}]`);

    return {
      message: isReassignment ? 'Vendor reassigned successfully' : 'Vendor assigned successfully',
      result,
    };
  }

  /**
   * Admin adds internal note to Service Request
   */
  async addInternalNoteAdmin(adminUserId: string, requestId: string, dto: AddInternalNoteDto) {
    await this.getRequestByIdAdmin(requestId);

    const note = await this.prisma.comment.create({
      data: {
        serviceRequestId: requestId,
        userId: adminUserId,
        comment: dto.comment.trim(),
      },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });

    this.logger.log(`[AUDIT_EVENT] [INTERNAL_NOTE_ADDED] Admin: [${adminUserId}] Request: [${requestId}] Note: [${note.id}]`);

    return {
      message: 'Internal note added successfully',
      note,
    };
  }

  /**
   * Admin changes status through central state machine
   */
  async changeStatusAdmin(adminUserId: string, requestId: string, dto: ChangeStatusDto) {
    const { request } = await this.getRequestByIdAdmin(requestId);

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        requestId: request.id,
        currentStatus: request.status,
        targetStatus: dto.status,
        expectedVersion: request.version,
        actorUserId: adminUserId,
        remarks: dto.remarks || 'Status changed by Admin',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [SERVICE_REQUEST_STATUS_CHANGED] Admin: [${adminUserId}] Request: [${requestId}] Status: [${dto.status}]`);

    return {
      message: 'Request status updated successfully',
      result,
    };
  }

  // ==============================================================================
  // VENDOR OPERATIONS
  // ==============================================================================

  /**
   * Vendor lists requests assigned to them
   */
  async getAssignedRequestsVendor(userId: string, query: QueryServiceRequestDto) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceRequestWhereInput = {
      assignedVendorId: vendor.id,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        OR: [
          { ticketNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { title: { contains: query.search.trim(), mode: 'insensitive' } },
          { description: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, requests] = await Promise.all([
      this.prisma.serviceRequest.count({ where }),
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          preferredDate: true,
          createdAt: true,
          serviceCategory: { select: { id: true, name: true } },
          address: { select: { id: true, label: true, city: true, state: true, postalCode: true } },
        },
      }),
    ]);

    return {
      message: 'Assigned service requests retrieved successfully',
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Vendor views assigned request details enforcing ownership
   */
  async getAssignedRequestByIdVendor(userId: string, requestId: string) {
    const vendor = await this.getVendorProfileOrThrow(userId);

    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        ticketNumber: true,
        assignedVendorId: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        preferredDate: true,
        createdAt: true,
        serviceCategory: { select: { id: true, name: true, description: true } },
        address: { select: { id: true, label: true, addressLine1: true, city: true, state: true, postalCode: true } },
        attachments: { select: { id: true, fileName: true, url: true, mimeType: true, fileSize: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.assignedVendorId !== vendor.id) {
      throw new ForbiddenException('You do not have permission to view this assigned service request');
    }

    return {
      message: 'Assigned request details retrieved successfully',
      request,
    };
  }

  /**
   * Vendor accepts assignment
   */
  async acceptAssignmentVendor(userId: string, requestId: string, dto?: VendorResponseDto) {
    const { request } = await this.getAssignedRequestByIdVendor(userId, requestId);

    if (request.status !== RequestStatus.ASSIGNED) {
      throw new BadRequestException(`Cannot accept request in status ${request.status}`);
    }

    await this.prisma.serviceRequestHistory.create({
      data: {
        serviceRequestId: requestId,
        fromStatus: RequestStatus.ASSIGNED,
        toStatus: RequestStatus.ASSIGNED,
        changedById: userId,
        remarks: dto?.remarks || 'Assignment accepted by Vendor',
      },
    });

    this.logger.log(`[AUDIT_EVENT] [SERVICE_REQUEST_ACCEPTED] Vendor: [${userId}] Request: [${requestId}]`);

    return {
      message: 'Assignment accepted successfully',
    };
  }

  /**
   * Vendor rejects assignment (reverts request to unassigned CREATED status for Admin review)
   */
  async rejectAssignmentVendor(userId: string, requestId: string, dto?: VendorResponseDto) {
    const { request } = await this.getAssignedRequestByIdVendor(userId, requestId);

    if (request.status !== RequestStatus.ASSIGNED) {
      throw new BadRequestException(`Cannot reject request in status ${request.status}`);
    }

    const currentReq = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { version: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        requestId: request.id,
        currentStatus: RequestStatus.ASSIGNED,
        targetStatus: RequestStatus.CREATED,
        expectedVersion: currentReq!.version,
        actorUserId: userId,
        assignedVendorId: null, // Clear assigned vendor
        remarks: dto?.remarks || 'Assignment rejected by Vendor',
      });
    });

    this.logger.log(`[AUDIT_EVENT] [SERVICE_REQUEST_REJECTED] Vendor: [${userId}] Request: [${requestId}]`);

    return {
      message: 'Assignment rejected successfully. Request returned to unassigned pool.',
      result,
    };
  }
}
