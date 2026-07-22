import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Unique email address for registration',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: '+18005550199',
    description: 'Unique phone number with country code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid E.164 international format string (e.g. +18005550199)',
  })
  phone!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password requiring at least 8 characters, 1 uppercase, 1 lowercase, and 1 number or special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and at least 1 number or special character',
  })
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({
    example: 'Acme Enterprises LLC',
    description: 'Optional company name for commercial accounts',
  })
  @IsOptional()
  @IsString()
  companyName?: string;
}
