import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryNotificationDto {
  @ApiPropertyOptional({ example: false, description: 'Filter by read status (true or false)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ enum: NotificationType, example: NotificationType.WORK_ORDER_UPDATE, description: 'Filter by NotificationType' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: 1, description: 'Page number (min 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page (1-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Field to sort by (createdAt, sentAt)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort direction (asc or desc)' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
