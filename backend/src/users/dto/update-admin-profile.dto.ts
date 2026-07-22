import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional({ example: 'Operations & Dispatch', description: 'Admin department' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  department?: string;
}
