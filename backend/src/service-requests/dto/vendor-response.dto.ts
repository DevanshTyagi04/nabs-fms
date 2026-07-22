import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class VendorResponseDto {
  @ApiPropertyOptional({ example: 'Confirmed. Technician scheduled to visit tomorrow morning.', description: 'Vendor remarks or acceptance/rejection notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remarks?: string;
}
