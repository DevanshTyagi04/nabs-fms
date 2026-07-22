import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'e1234567-89ab-cdef-0123-456789abcdef', description: 'Approved Estimate UUID' })
  @IsNotEmpty({ message: 'Estimate ID is required' })
  @IsUUID('4', { message: 'Invalid Estimate UUID' })
  estimateId!: string;

  @ApiProperty({ example: '2026-08-05T09:00:00Z', description: 'Scheduled work start time' })
  @IsNotEmpty({ message: 'Scheduled start date is required' })
  @IsDateString({}, { message: 'scheduledStart must be a valid ISO 8601 date string' })
  scheduledStart!: string;

  @ApiProperty({ example: '2026-08-05T17:00:00Z', description: 'Scheduled work completion target time' })
  @IsNotEmpty({ message: 'Scheduled end date is required' })
  @IsDateString({}, { message: 'scheduledEnd must be a valid ISO 8601 date string' })
  scheduledEnd!: string;

  @ApiPropertyOptional({ example: 8, description: 'Estimated execution duration in hours' })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Estimated duration must be at least 1 hour' })
  estimatedDuration?: number;
}
