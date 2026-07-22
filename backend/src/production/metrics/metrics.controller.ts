import { Controller, Get, Header, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators';
import { MetricsService } from './metrics.service';

@ApiTags('Production Operational Readiness & Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiOperation({ summary: 'Expose Prometheus Metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics returned.' })
  getMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }
}
