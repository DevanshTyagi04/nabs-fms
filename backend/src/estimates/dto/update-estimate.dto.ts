import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateEstimateDto {
  @ApiPropertyOptional({ example: 'Updated terms: Payment due within 7 days of invoice.', description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  termsAndConditions?: string;

  @ApiPropertyOptional({ example: '2026-08-30T23:59:59Z', description: 'Quotation validity date' })
  @IsOptional()
  @IsDateString({}, { message: 'validUntil must be a valid ISO date string' })
  validUntil?: string;

  @ApiPropertyOptional({ example: 100.0, description: 'Overall estimate discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount amount cannot be negative' })
  discountAmount?: number;
}
