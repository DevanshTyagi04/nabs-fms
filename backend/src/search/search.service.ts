import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma';
import { QuerySearchDto } from './dto';
import { FilterBuilderService, UserContext } from './filters/filter-builder.service';
import { PaginationService } from './pagination/pagination.service';
import { SortingService } from './sorting/sorting.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filterBuilder: FilterBuilderService,
    private readonly sortingService: SortingService,
    private readonly paginationService: PaginationService,
  ) {}

  /**
   * Helper: Resolves UserContext (CustomerProfileId / VendorProfileId) for ownership scoping
   */
  private async resolveUserContext(userId: string): Promise<UserContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        customerProfile: { select: { id: true } },
        vendorProfile: { select: { id: true } },
      },
    });

    return {
      userId,
      role: user?.role || UserRole.CUSTOMER,
      customerProfileId: user?.customerProfile?.id,
      vendorProfileId: user?.vendorProfile?.id,
    };
  }

  /**
   * Helper: Formats standardized search response contract
   */
  private buildSearchResponse(items: any[], total: number, dto: QuerySearchDto) {
    const pagination = this.paginationService.buildPaginationMeta(total, dto);
    return {
      items,
      pagination,
      filters: {
        search: dto.search || null,
        status: dto.status || null,
        startDate: dto.startDate || null,
        endDate: dto.endDate || null,
        paymentMethod: dto.paymentMethod || null,
        gateway: dto.gateway || null,
      },
      sorting: {
        sortBy: dto.sortBy || 'createdAt',
        sortOrder: dto.sortOrder || 'desc',
      },
    };
  }

  // ==============================================================================
  // SEARCH EXECUTION IMPLEMENTATIONS
  // ==============================================================================

  async searchServiceRequests(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildServiceRequestWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('ServiceRequest', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.serviceRequest.count({ where }),
      this.prisma.serviceRequest.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          customer: { select: { firstName: true, lastName: true } },
          assignedVendor: { select: { businessName: true } },
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }

  async searchSurveys(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildSurveyWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('Survey', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.survey.count({ where }),
      this.prisma.survey.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          version: true,
          status: true,
          submittedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }

  async searchEstimates(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildEstimateWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('Estimate', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.estimate.count({ where }),
      this.prisma.estimate.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          version: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }

  async searchWorkOrders(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildWorkOrderWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('WorkOrder', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          workOrderNumber: true,
          status: true,
          scheduledStart: true,
          completedAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          assignedVendor: { select: { businessName: true } },
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }

  async searchPayments(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildPaymentWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('Payment', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          paymentNumber: true,
          amount: true,
          type: true,
          status: true,
          gateway: true,
          paymentMethod: true,
          paidAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }

  async searchInvoices(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildInvoiceWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('Invoice', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          issuedAt: true,
          pdfUrl: true,
          createdAt: true,
          payment: { select: { paymentNumber: true, serviceRequest: { select: { ticketNumber: true } } } },
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }

  async searchNotifications(userId: string, dto: QuerySearchDto) {
    const userContext = await this.resolveUserContext(userId);
    const where = this.filterBuilder.buildNotificationWhere(dto, userContext);
    const orderBy = this.sortingService.getOrderBy('Notification', dto);
    const { skip, take } = this.paginationService.getOffsetPagination(dto);

    const [total, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          deliveryStatus: true,
          isRead: true,
          sentAt: true,
          createdAt: true,
        },
      }),
    ]);

    return this.buildSearchResponse(items, total, dto);
  }
}
