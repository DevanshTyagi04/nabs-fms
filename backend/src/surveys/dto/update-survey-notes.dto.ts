import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateSurveyNotesDto {
  @ApiPropertyOptional({ example: 'Updated inspection notes after completing compressor check.', description: 'Survey notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({ example: '2026-08-01T09:30:00Z', description: 'Inspection start timestamp' })
  @IsOptional()
  @IsDateString({}, { message: 'startedAt must be a valid ISO 8601 date string' })
  startedAt?: string;
}
