import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import { StorageService } from '../../storage/storage.service';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  isReady: boolean;
  dependencies: {
    postgres: { status: 'up' | 'down'; isCritical: boolean; latencyMs?: number; error?: string };
    redis?: { status: 'up' | 'down'; isCritical: boolean; latencyMs?: number };
    storage?: { status: 'up' | 'down'; isCritical: boolean; provider?: string };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private isShuttingDown = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  setShuttingDown(shuttingDown: boolean) {
    this.isShuttingDown = shuttingDown;
  }

  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  async getReadiness(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor(process.uptime());

    if (this.isShuttingDown) {
      return {
        status: 'down',
        timestamp,
        uptime,
        isReady: false,
        dependencies: {
          postgres: { status: 'down', isCritical: true, error: 'Application shutting down' },
        },
      };
    }

    let postgresStatus: 'up' | 'down' = 'down';
    let postgresLatencyMs: number | undefined;
    let postgresError: string | undefined;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      postgresLatencyMs = Date.now() - start;
      postgresStatus = 'up';
    } catch (err: any) {
      postgresStatus = 'down';
      postgresError = err.message;
      this.logger.error(`PostgreSQL health probe failed: ${err.message}`);
    }

    let storageStatus: 'up' | 'down' = 'up';
    let storageProviderName = 'local';
    try {
      const storageHealth = await this.storageService.checkHealth();
      storageStatus = storageHealth.isHealthy ? 'up' : 'down';
    } catch {
      storageStatus = 'down';
    }

    // Recommendation 1: Critical vs Optional dependency classification
    const isCriticalReady = postgresStatus === 'up';
    const isDegraded = storageStatus === 'down';

    return {
      status: !isCriticalReady ? 'down' : isDegraded ? 'degraded' : 'ok',
      timestamp,
      uptime,
      isReady: isCriticalReady,
      dependencies: {
        postgres: {
          status: postgresStatus,
          isCritical: true,
          latencyMs: postgresLatencyMs,
          error: postgresError,
        },
        storage: {
          status: storageStatus,
          isCritical: false,
          provider: storageProviderName,
        },
      },
    };
  }
}
