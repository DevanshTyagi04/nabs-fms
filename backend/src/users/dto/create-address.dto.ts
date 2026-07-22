import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home Office', description: 'Address label' })
  @IsNotEmpty({ message: 'Address label is required' })
  @IsString()
  @Length(2, 50)
  label!: string;

  @ApiPropertyOptional({ enum: AddressType, example: AddressType.HOME, description: 'Address type' })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @ApiProperty({ example: '123 Innovation Way', description: 'Primary address line' })
  @IsNotEmpty({ message: 'Address line 1 is required' })
  @IsString()
  @Length(3, 150)
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Suite 400', description: 'Secondary address line' })
  @IsOptional()
  @IsString()
  @Length(0, 150)
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Near Tech Park', description: 'Nearby landmark' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  landmark?: string;

  @ApiProperty({ example: 'San Francisco', description: 'City name' })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  @Length(2, 50)
  city!: string;

  @ApiProperty({ example: 'California', description: 'State/Province' })
  @IsNotEmpty({ message: 'State is required' })
  @IsString()
  @Length(2, 50)
  state!: string;

  @ApiProperty({ example: 'United States', description: 'Country' })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString()
  @Length(2, 50)
  country!: string;

  @ApiProperty({ example: '94105', description: 'Postal/Zip Code' })
  @IsNotEmpty({ message: 'Postal code is required' })
  @IsString()
  @Length(3, 20)
  postalCode!: string;

  @ApiPropertyOptional({ example: 37.7749, description: 'Latitude coordinate' })
  @IsOptional()
  @IsLatitude({ message: 'Invalid latitude coordinate' })
  latitude?: number;

  @ApiPropertyOptional({ example: -122.4194, description: 'Longitude coordinate' })
  @IsOptional()
  @IsLongitude({ message: 'Invalid longitude coordinate' })
  longitude?: number;

  @ApiPropertyOptional({ example: false, description: 'Set as default address' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
