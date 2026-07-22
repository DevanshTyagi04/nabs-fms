import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Specific refresh token to revoke (if logging out single session)',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Set to true to revoke all active sessions across all devices for this user',
  })
  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}
