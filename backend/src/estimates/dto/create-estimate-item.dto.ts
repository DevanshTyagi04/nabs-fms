import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateEstimateItemDto {
  @ApiProperty({ example: '45/5 MFD Dual Run Capacitor (Heavy Duty)', description: 'Item description' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @Length(2, 250)
  description!: string;

  @ApiProperty({ example: 1, description: 'Item quantity (positive decimal)' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber()
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity!: number;

  @ApiProperty({ example: 450.0, description: 'Unit price per quantity' })
  @IsNotEmpty({ message: 'Unit price is required' })
  @IsNumber()
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice!: number;

  @ApiPropertyOptional({ example: 18.0, description: 'GST/Tax percentage rate (e.g. 18.00)' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Tax rate cannot be negative' })
  @Max(100, { message: 'Tax rate cannot exceed 100%' })
  taxRate?: number;

  @ApiPropertyOptional({ example: 0.0, description: 'Line item discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount cannot be negative' })
  discount?: number;
}
