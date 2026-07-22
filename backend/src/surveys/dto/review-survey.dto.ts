import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class ReviewSurveyDto {
  @ApiProperty({
    enum: [SurveyStatus.APPROVED, SurveyStatus.REJECTED],
    example: SurveyStatus.APPROVED,
    description: 'Admin review decision (APPROVED or REJECTED)',
  })
  @IsNotEmpty({ message: 'Review status is required' })
  @IsEnum(SurveyStatus, { message: 'Status must be APPROVED or REJECTED' })
  status!: SurveyStatus;

  @ApiPropertyOptional({ example: 'Inspection findings approved for estimate generation.', description: 'Admin review remarks' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remarks?: string;
}
