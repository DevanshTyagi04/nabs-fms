import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateSurveyDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'ServiceRequest UUID' })
  @IsNotEmpty({ message: 'ServiceRequest ID is required' })
  @IsUUID('4', { message: 'Invalid ServiceRequest UUID' })
  serviceRequestId!: string;

  @ApiPropertyOptional({
    example: 'Initial site walkthrough notes and technical inspection setup.',
    description: 'Initial survey inspection notes',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({ example: '2026-08-01T09:30:00Z', description: 'Inspection start timestamp' })
  @IsOptional()
  @IsDateString({}, { message: 'startedAt must be a valid ISO 8601 date string' })
  startedAt?: string;
}
