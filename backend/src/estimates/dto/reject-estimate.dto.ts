import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class RejectEstimateDto {
  @ApiPropertyOptional({ example: 'Pricing is above budget limit. Requested revision.', description: 'Customer rejection remarks' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remarks?: string;
}
