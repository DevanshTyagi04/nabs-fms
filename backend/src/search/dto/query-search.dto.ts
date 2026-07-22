import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class QuerySearchDto {
  @ApiPropertyOptional({ example: 'SR-2026', description: 'Global search keyword (max 100 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Search query string cannot exceed 100 characters' })
  search?: string;

  @ApiPropertyOptional({ example: 'COMPLETED', description: 'Entity status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'SYSTEM', description: 'Notification or Payment type filter' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'CARD', description: 'Payment method filter' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'RAZORPAY', description: 'Payment gateway filter' })
  @IsOptional()
  @IsString()
  gateway?: string;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00Z', description: 'Filter created on or after date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-31T23:59:59Z', description: 'Filter created on or before date' })
  @IsOptional()
  @IsString()
  endDate?: string;

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
  @Max(100, { message: 'Page size limit cannot exceed 100 items' })
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field name' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort direction (asc or desc)' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
