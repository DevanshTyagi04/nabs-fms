import { BadRequestException, Injectable } from '@nestjs/common';
import { QuerySearchDto } from '../dto';

// Entity Whitelisted Sort Fields
export const ENTITY_SORT_ALLOWLISTS: Record<string, string[]> = {
  ServiceRequest: ['createdAt', 'updatedAt', 'status', 'ticketNumber', 'title'],
  Survey: ['createdAt', 'updatedAt', 'status', 'version'],
  Estimate: ['createdAt', 'updatedAt', 'status', 'version', 'totalAmount'],
  WorkOrder: ['createdAt', 'updatedAt', 'status', 'workOrderNumber'],
  Payment: ['createdAt', 'updatedAt', 'status', 'amount', 'paymentNumber', 'paymentMethod'],
  Invoice: ['createdAt', 'updatedAt', 'status', 'totalAmount', 'dueAmount', 'invoiceNumber', 'issuedAt'],
  Notification: ['createdAt', 'sentAt', 'readAt', 'type', 'deliveryStatus', 'title'],
};

@Injectable()
export class SortingService {
  /**
   * Validates requested sort field against entity allowlist & returns deterministic sort clause
   */
  getOrderBy(entityName: string, dto: QuerySearchDto) {
    const allowedFields = ENTITY_SORT_ALLOWLISTS[entityName] || ['createdAt', 'updatedAt', 'status'];
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = (dto.sortOrder || 'desc').toLowerCase() as 'asc' | 'desc';

    if (!allowedFields.includes(sortBy)) {
      throw new BadRequestException(
        `Invalid sort field [${sortBy}] for ${entityName}. Allowed fields: [${allowedFields.join(', ')}]`,
      );
    }

    // Deterministic Tie-Breaker Sorting: Append id asc to ensure stable pagination across requests
    return [
      { [sortBy]: sortOrder },
      { id: 'asc' as const },
    ];
  }
}
