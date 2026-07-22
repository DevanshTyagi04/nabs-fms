import { Injectable } from '@nestjs/common';
import { QuerySearchDto } from '../dto';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

@Injectable()
export class PaginationService {
  /**
   * Calculates database skip/take offsets from QuerySearchDto
   */
  getOffsetPagination(dto: QuerySearchDto): PaginationOptions {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 && dto.limit <= 100 ? dto.limit : 10;
    const skip = (page - 1) * limit;

    return { skip, take: limit };
  }

  /**
   * Constructs standardized pagination metadata
   */
  buildPaginationMeta(totalItems: number, dto: QuerySearchDto): PaginationMeta {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const pageSize = dto.limit && dto.limit > 0 && dto.limit <= 100 ? dto.limit : 10;
    const totalPages = Math.ceil(totalItems / pageSize) || (totalItems === 0 ? 0 : 1);

    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
