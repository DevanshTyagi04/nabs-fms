import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma';
import { StorageModule } from '../storage';
import { CacheService } from './cache/cache.service';
import { DiagnosticsController } from './diagnostics/diagnostics.controller';
import { DiagnosticsService } from './diagnostics/diagnostics.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { ShutdownService } from './shutdown/shutdown.service';
import { TracingService } from './tracing/tracing.service';

@Module({
  imports: [PrismaModule, ConfigModule, StorageModule],
  controllers: [
    HealthController,
    MetricsController,
    DiagnosticsController,
  ],
  providers: [
    HealthService,
    MetricsService,
    TracingService,
    CacheService,
    DiagnosticsService,
    ShutdownService,
  ],
  exports: [
    HealthService,
    MetricsService,
    TracingService,
    CacheService,
    DiagnosticsService,
    ShutdownService,
  ],
})
export class ProductionModule {}
