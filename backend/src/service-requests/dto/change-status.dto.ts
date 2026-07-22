import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({ enum: RequestStatus, example: RequestStatus.CANCELLED, description: 'Target RequestStatus' })
  @IsNotEmpty({ message: 'Target status is required' })
  @IsEnum(RequestStatus)
  status!: RequestStatus;

  @ApiPropertyOptional({ example: 'Cancelled per customer phone request.', description: 'Reason or remarks for status change' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remarks?: string;
}
