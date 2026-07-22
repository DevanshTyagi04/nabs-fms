import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum ReportPeriod {
  TODAY = 'TODAY',
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  CUSTOM = 'CUSTOM',
}

export class QueryReportDateDto {
  @ApiPropertyOptional({ enum: ReportPeriod, example: ReportPeriod.THIS_MONTH, description: 'Predefined date period filter' })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00Z', description: 'Start date for CUSTOM period filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-31T23:59:59Z', description: 'End date for CUSTOM period filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Optional Vendor Profile UUID filter for Admin reports' })
  @IsOptional()
  @IsUUID('4')
  vendorId?: string;
}
