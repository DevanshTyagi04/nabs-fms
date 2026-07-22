import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FilterBuilderService } from './filters/filter-builder.service';
import { PaginationService } from './pagination/pagination.service';
import { SearchService } from './search.service';
import { SortingService } from './sorting/sorting.service';

describe('Search & Global Filtering Module (Phase 12 Unit & Integration Tests)', () => {
  let searchService: SearchService;
  let filterBuilder: FilterBuilderService;
  let sortingService: SortingService;
  let paginationService: PaginationService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: { findUnique: jest.fn() },
      serviceRequest: { count: jest.fn(), findMany: jest.fn() },
      survey: { count: jest.fn(), findMany: jest.fn() },
      estimate: { count: jest.fn(), findMany: jest.fn() },
      workOrder: { count: jest.fn(), findMany: jest.fn() },
      payment: { count: jest.fn(), findMany: jest.fn() },
      invoice: { count: jest.fn(), findMany: jest.fn() },
      notification: { count: jest.fn(), findMany: jest.fn() },
    };

    filterBuilder = new FilterBuilderService();
    sortingService = new SortingService();
    paginationService = new PaginationService();
    searchService = new SearchService(prismaMock, filterBuilder, sortingService, paginationService);
  });

  describe('FilterBuilderService', () => {
    it('should inject customer profile scoping for CUSTOMER role', () => {
      const where = filterBuilder.buildServiceRequestWhere(
        { search: 'AC Repair', status: 'COMPLETED' },
        { userId: 'u-1', role: UserRole.CUSTOMER, customerProfileId: 'c-profile-1' },
      );

      expect(where.customerId).toBe('c-profile-1');
      expect(where.status).toBe('COMPLETED');
      expect(where.OR).toBeDefined();
    });

    it('should inject vendor profile scoping for VENDOR role', () => {
      const where = filterBuilder.buildWorkOrderWhere(
        { search: 'WO-100' },
        { userId: 'u-v1', role: UserRole.VENDOR, vendorProfileId: 'v-profile-1' },
      );

      expect(where.assignedVendorId).toBe('v-profile-1');
    });

    it('should throw BadRequestException if startDate > endDate', () => {
      expect(() => {
        filterBuilder.buildServiceRequestWhere(
          { startDate: '2026-08-01', endDate: '2026-07-01' },
          { userId: 'u-1', role: UserRole.ADMIN },
        );
      }).toThrow(BadRequestException);
    });
  });

  describe('SortingService & PaginationService', () => {
    it('should validate allowed sort fields and append deterministic id tie-breaker', () => {
      const orderBy = sortingService.getOrderBy('ServiceRequest', { sortBy: 'ticketNumber', sortOrder: 'asc' });

      expect(orderBy).toEqual([
        { ticketNumber: 'asc' },
        { id: 'asc' },
      ]);
    });

    it('should throw BadRequestException for un-whitelisted sort fields', () => {
      expect(() => {
        sortingService.getOrderBy('ServiceRequest', { sortBy: 'unsupportedField' });
      }).toThrow(BadRequestException);
    });

    it('should calculate offset pagination and format metadata correctly', () => {
      const offset = paginationService.getOffsetPagination({ page: 2, limit: 10 });
      expect(offset).toEqual({ skip: 10, take: 10 });

      const meta = paginationService.buildPaginationMeta(45, { page: 2, limit: 10 });
      expect(meta).toEqual({
        page: 2,
        pageSize: 10,
        totalItems: 45,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });

  describe('SearchService (Standardized Response Contract)', () => {
    it('should search Service Requests and return normalized search response structure', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-admin',
        role: UserRole.ADMIN,
      });

      prismaMock.serviceRequest.count.mockResolvedValue(1);
      prismaMock.serviceRequest.findMany.mockResolvedValue([
        { id: 'sr-1', ticketNumber: 'SR-100', title: 'AC Repair', status: 'COMPLETED' },
      ]);

      const res = await searchService.searchServiceRequests('u-admin', { search: 'AC', page: 1, limit: 10 });

      expect(res.items).toHaveLength(1);
      expect(res.pagination.totalItems).toBe(1);
      expect(res.filters.search).toBe('AC');
      expect(res.sorting.sortBy).toBe('createdAt');
    });
  });
});
