import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateEstimateDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'ServiceRequest UUID' })
  @IsNotEmpty({ message: 'ServiceRequest ID is required' })
  @IsUUID('4', { message: 'Invalid ServiceRequest UUID' })
  serviceRequestId!: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', description: 'Survey UUID if applicable' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid Survey UUID' })
  surveyId?: string;

  @ApiPropertyOptional({
    example: 'Payment terms: 50% advance upon work order approval, 50% upon job completion. Quote valid for 15 days.',
    description: 'Terms and conditions for quotation',
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  termsAndConditions?: string;

  @ApiPropertyOptional({ example: '2026-08-15T23:59:59Z', description: 'Quotation validity expiration timestamp' })
  @IsOptional()
  @IsDateString({}, { message: 'validUntil must be a valid ISO 8601 date string' })
  validUntil?: string;

  @ApiPropertyOptional({ example: 50.0, description: 'Overall estimate discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount amount cannot be negative' })
  discountAmount?: number;
}
