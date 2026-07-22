import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { QuerySearchDto } from '../dto';

export interface UserContext {
  userId: string;
  role: UserRole;
  customerProfileId?: string;
  vendorProfileId?: string;
}

@Injectable()
export class FilterBuilderService {
  /**
   * Helper: Validates date range parameters
   */
  private validateAndExtractDateRange(dto: QuerySearchDto) {
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (start > end) {
        throw new BadRequestException('startDate cannot be later than endDate');
      }
    }

    return {
      ...(dto.startDate && { gte: new Date(dto.startDate) }),
      ...(dto.endDate && { lte: new Date(dto.endDate) }),
    };
  }

  /**
   * Entity 1: Service Request Filter Composition (Isolated query mapping)
   */
  buildServiceRequestWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { status: dto.status as any }),
    };

    // Role-based Ownership Scoping
    if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
      where.customerId = userContext.customerProfileId;
    } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
      where.assignedVendorId = userContext.vendorProfileId;
    }

    if (searchKeyword) {
      where.OR = [
        { ticketNumber: { contains: searchKeyword, mode: 'insensitive' } },
        { title: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Entity 2: Survey Filter Composition (Isolated query mapping)
   */
  buildSurveyWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { status: dto.status as any }),
    };

    if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
      where.serviceRequest = { customerId: userContext.customerProfileId };
    } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
      where.serviceRequest = { assignedVendorId: userContext.vendorProfileId };
    }

    if (searchKeyword) {
      where.OR = [
        { notes: { contains: searchKeyword, mode: 'insensitive' } },
        { serviceRequest: { ticketNumber: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  /**
   * Entity 3: Estimate Filter Composition (Isolated query mapping)
   */
  buildEstimateWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { status: dto.status as any }),
    };

    if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
      where.serviceRequest = { customerId: userContext.customerProfileId };
    } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
      where.serviceRequest = { assignedVendorId: userContext.vendorProfileId };
    }

    if (searchKeyword) {
      where.OR = [
        { notes: { contains: searchKeyword, mode: 'insensitive' } },
        { serviceRequest: { ticketNumber: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  /**
   * Entity 4: Work Order Filter Composition (Isolated query mapping)
   */
  buildWorkOrderWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { status: dto.status as any }),
    };

    if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
      where.serviceRequest = { customerId: userContext.customerProfileId };
    } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
      where.assignedVendorId = userContext.vendorProfileId;
    }

    if (searchKeyword) {
      where.OR = [
        { workOrderNumber: { contains: searchKeyword, mode: 'insensitive' } },
        { serviceRequest: { ticketNumber: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  /**
   * Entity 5: Payment Filter Composition (Isolated query mapping)
   */
  buildPaymentWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { status: dto.status as any }),
      ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod as any }),
      ...(dto.gateway && { gateway: dto.gateway as any }),
    };

    if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
      where.serviceRequest = { customerId: userContext.customerProfileId };
    } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
      where.serviceRequest = { assignedVendorId: userContext.vendorProfileId };
    }

    if (searchKeyword) {
      where.OR = [
        { paymentNumber: { contains: searchKeyword, mode: 'insensitive' } },
        { gatewayTransactionId: { contains: searchKeyword, mode: 'insensitive' } },
        { gatewayOrderId: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Entity 6: Invoice Filter Composition (Isolated query mapping)
   */
  buildInvoiceWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { status: dto.status as any }),
    };

    if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
      where.payment = { serviceRequest: { customerId: userContext.customerProfileId } };
    } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
      where.payment = { serviceRequest: { assignedVendorId: userContext.vendorProfileId } };
    }

    if (searchKeyword) {
      where.OR = [
        { invoiceNumber: { contains: searchKeyword, mode: 'insensitive' } },
        { payment: { paymentNumber: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  /**
   * Entity 7: Notification Filter Composition (Isolated query mapping)
   */
  buildNotificationWhere(dto: QuerySearchDto, userContext: UserContext) {
    const dateRange = this.validateAndExtractDateRange(dto);
    const searchKeyword = dto.search?.trim();

    const where: any = {
      ...(dateRange.gte || dateRange.lte ? { createdAt: dateRange } : {}),
      ...(dto.status && { deliveryStatus: dto.status as any }),
      ...(dto.type && { type: dto.type as any }),
    };

    // Scoped strictly to authenticated user unless ADMIN inspecting platform logs
    if (userContext.role !== UserRole.ADMIN) {
      where.recipientId = userContext.userId;
    }

    if (searchKeyword) {
      where.OR = [
        { title: { contains: searchKeyword, mode: 'insensitive' } },
        { body: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
