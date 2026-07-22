import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AssignVendorDto {
  @ApiProperty({ example: 'v1234567-89ab-cdef-0123-456789abcdef', description: 'VendorProfile UUID' })
  @IsNotEmpty({ message: 'Vendor ID is required' })
  @IsUUID('4', { message: 'Invalid VendorProfile UUID' })
  vendorId!: string;

  @ApiPropertyOptional({ example: 'Assigned based on HVAC expertise and proximity.', description: 'Admin assignment remarks' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remarks?: string;
}
