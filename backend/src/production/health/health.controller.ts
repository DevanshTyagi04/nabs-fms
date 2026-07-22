import { Controller, Get, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators';
import { HealthService } from './health.service';

@ApiTags('Production Operational Readiness & Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Comprehensive System Health Overview' })
  @ApiResponse({ status: 200, description: 'System health status overview returned.' })
  async getHealth() {
    return this.healthService.getReadiness();
  }

  @Public()
  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness Probe Check (Kubernetes / Orchestrator)' })
  @ApiResponse({ status: 200, description: 'Process is alive.' })
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness Probe Check (PostgreSQL Critical Probe)' })
  @ApiResponse({ status: 200, description: 'Application is ready to handle traffic.' })
  @ApiResponse({ status: 503, description: 'Critical dependency unavailable or application shutting down.' })
  async getReadiness() {
    const res = await this.healthService.getReadiness();
    if (!res.isReady) {
      throw new HttpException(res, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return res;
  }
}
