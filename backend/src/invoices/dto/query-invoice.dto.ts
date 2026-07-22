import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class QueryInvoiceDto {
  @ApiPropertyOptional({ example: 'INV-20260805', description: 'Search invoice number or ticket number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus, example: InvoiceStatus.ISSUED, description: 'Filter by InvoiceStatus' })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Filter by Payment UUID' })
  @IsOptional()
  @IsUUID('4')
  paymentId?: string;

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

  @ApiPropertyOptional({ example: 'createdAt', description: 'Field to sort by (createdAt, totalAmount, issuedAt)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort direction (asc or desc)' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
