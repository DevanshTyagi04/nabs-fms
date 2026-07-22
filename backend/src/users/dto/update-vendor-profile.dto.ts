import { ApiPropertyOptional } from '@nestjs/swagger';
import { VendorAvailabilityStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
  Length,
} from 'class-validator';

export class UpdateVendorProfileDto {
  @ApiPropertyOptional({ example: 'Apex HVAC Solutions', description: 'Business/Company name' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  companyName?: string;

  @ApiPropertyOptional({
    example: 'Licensed HVAC technician with 8+ years of commercial repair experience.',
    description: 'Vendor bio & professional description',
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  bio?: string;

  @ApiPropertyOptional({ example: 8, description: 'Years of professional experience' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(70)
  yearsExperience?: number;

  @ApiPropertyOptional({
    enum: VendorAvailabilityStatus,
    example: VendorAvailabilityStatus.AVAILABLE,
    description: 'Current availability status',
  })
  @IsOptional()
  @IsEnum(VendorAvailabilityStatus)
  availabilityStatus?: VendorAvailabilityStatus;

  @ApiPropertyOptional({ example: '22AAAAA0000A1Z5', description: 'Indian GST identification number' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST number format',
  })
  gstNumber?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F', description: 'Indian PAN card number' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN card number format',
  })
  panNumber?: string;

  @ApiPropertyOptional({ example: '+18005550199', description: 'Secondary business contact phone' })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Secondary phone number must be in E.164 format (+18005550199)',
  })
  secondaryPhone?: string;

  @ApiPropertyOptional({ example: '/uploads/avatars/vendor-avatar.jpg', description: 'Profile image path or URL' })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
