import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(private readonly configService: ConfigService) {}

  getDiagnostics() {
    const memory = process.memoryUsage();
    return {
      version: '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsage: {
        rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
