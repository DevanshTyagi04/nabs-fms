import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Comprehensive health check status' })
  @ApiResponse({ status: 200, description: 'Application and database status overview' })
  async getHealth() {
    const environment = this.configService.get<string>('NODE_ENV') || 'development';
    const startTime = process.uptime();
    const timestamp = new Date().toISOString();

    let dbStatus = 'down';
    let dbLatencyMs: number | null = null;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    return {
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      timestamp,
      uptime: Math.floor(startTime),
      version: '1.0.0',
      environment,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe check (Database connectivity)' })
  @ApiResponse({ status: 200, description: 'Service is ready to handle traffic' })
  @ApiResponse({ status: 503, description: 'Database connectivity probe failed' })
  async getReadiness() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          latencyMs,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'unready',
          timestamp: new Date().toISOString(),
          database: {
            status: 'disconnected',
            error: error instanceof Error ? error.message : 'Database ping failed',
          },
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
