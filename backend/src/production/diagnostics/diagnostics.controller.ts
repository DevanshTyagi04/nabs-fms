import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators';
import { DiagnosticsService } from './diagnostics.service';

@ApiTags('Production Operational Readiness & Diagnostics')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve System Diagnostics & Operational Stats (Admin)' })
  @ApiResponse({ status: 200, description: 'Diagnostics data returned.' })
  getDiagnostics() {
    return this.diagnosticsService.getDiagnostics();
  }
}
