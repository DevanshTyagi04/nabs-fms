import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { HealthService } from '../health/health.service';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  private readonly logger = new Logger(ShutdownService.name);

  constructor(
    private readonly healthService: HealthService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Recommendation 5: Graceful Shutdown Sequence
   * 1. Mark readiness probe NOT READY (503)
   * 2. Allow in-flight requests/jobs to complete
   * 3. Cleanly disconnect Prisma and infrastructure connections
   */
  async onApplicationShutdown(signal?: string) {
    this.logger.log(`[GRACEFUL_SHUTDOWN_INITIATED] Intercepted signal [${signal || 'SIGTERM'}]. Marking readiness probe NOT READY.`);

    // 1. Instantly mark readiness endpoint as NOT READY
    this.healthService.setShuttingDown(true);

    // 2. Short grace period for orchestrator to deregister endpoint from active pool
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Disconnect Prisma safely
    try {
      this.logger.log('Disconnecting PostgreSQL Prisma client...');
      await this.prisma.$disconnect();
      this.logger.log('PostgreSQL Prisma client disconnected cleanly.');
    } catch (err: any) {
      this.logger.error(`Error disconnecting Prisma during shutdown: ${err.message}`);
    }
  }
}
