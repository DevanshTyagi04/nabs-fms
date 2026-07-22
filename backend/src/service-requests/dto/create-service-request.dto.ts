import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, RequestSource } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Customer Address UUID' })
  @IsNotEmpty({ message: 'Address ID is required' })
  @IsUUID('4', { message: 'Invalid address UUID' })
  addressId!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', description: 'Service Category UUID' })
  @IsNotEmpty({ message: 'Service Category ID is required' })
  @IsUUID('4', { message: 'Invalid service category UUID' })
  serviceCategoryId!: string;

  @ApiProperty({ example: 'AC Cooling Failure & Unusual Noise', description: 'Request summary title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @Length(3, 100)
  title!: string;

  @ApiProperty({
    example:
      'The split air conditioner in the primary office room stopped cooling and is making a loud buzzing noise.',
    description: 'Detailed description of the service request problem',
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @Length(10, 1000)
  description!: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.HIGH, description: 'Request urgency priority' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ example: '2026-08-01T10:00:00Z', description: 'Customer preferred date/time' })
  @IsOptional()
  @IsDateString({}, { message: 'Preferred date must be a valid ISO 8601 date string' })
  preferredDate?: string;

  @ApiPropertyOptional({ enum: RequestSource, example: RequestSource.ONE_TIME, description: 'Request source' })
  @IsOptional()
  @IsEnum(RequestSource)
  source?: RequestSource;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012', description: 'AMC Subscription UUID if applicable' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid AMC subscription UUID' })
  amcSubscriptionId?: string;
}
