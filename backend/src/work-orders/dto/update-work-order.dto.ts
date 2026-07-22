import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({ example: '2026-08-05T09:00:00Z', description: 'Scheduled work start time' })
  @IsOptional()
  @IsDateString({}, { message: 'scheduledStart must be a valid ISO 8601 date string' })
  scheduledStart?: string;

  @ApiPropertyOptional({ example: '2026-08-05T17:00:00Z', description: 'Scheduled work end time' })
  @IsOptional()
  @IsDateString({}, { message: 'scheduledEnd must be a valid ISO 8601 date string' })
  scheduledEnd?: string;

  @ApiPropertyOptional({ example: 8, description: 'Estimated execution duration in hours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
