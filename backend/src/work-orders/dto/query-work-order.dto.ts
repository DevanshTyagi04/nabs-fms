import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryWorkOrderDto {
  @ApiPropertyOptional({ example: 'WO-20260805', description: 'Search work order number or title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: WorkOrderStatus, example: WorkOrderStatus.IN_PROGRESS, description: 'Filter by WorkOrderStatus' })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Filter by ServiceRequest UUID' })
  @IsOptional()
  @IsUUID('4')
  serviceRequestId?: string;

  @ApiPropertyOptional({ description: 'Filter by VendorProfile UUID' })
  @IsOptional()
  @IsUUID('4')
  vendorId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number (min 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page (1-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Field to sort by (createdAt, scheduledStart, status)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort direction (asc or desc)' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
