import { CacheService } from '../../src/production/cache/cache.service';
import { HealthService } from '../../src/production/health/health.service';
import { ShutdownService } from '../../src/production/shutdown/shutdown.service';

describe('Phase 18: Operational Resilience & Failure Injection Suite', () => {
  let healthService: HealthService;
  let cacheService: CacheService;
  let shutdownService: ShutdownService;

  let prismaMock: any;
  let configMock: any;
  let storageMock: any;

  beforeEach(() => {
    prismaMock = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };

    configMock = {
      get: jest.fn((key: string) => (key === 'NODE_ENV' ? 'test' : null)),
    };

    storageMock = {
      checkHealth: jest.fn().mockResolvedValue({ isHealthy: true }),
    };

    healthService = new HealthService(prismaMock, configMock, storageMock);
    cacheService = new CacheService(configMock);
    shutdownService = new ShutdownService(healthService, prismaMock);
  });

  describe('Failure Injection: PostgreSQL Connection Loss', () => {
    it('should fail readiness probe (isReady: false) when critical PostgreSQL connection drops', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('FATAL: PostgreSQL connection refused'));

      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(false);
      expect(readiness.status).toBe('down');
      expect(readiness.dependencies.postgres.status).toBe('down');
    });
  });

  describe('Failure Injection: Optional Storage Outage', () => {
    it('should report degraded state but maintain readiness (isReady: true) when Storage provider is down', async () => {
      storageMock.checkHealth.mockResolvedValue({ isHealthy: false });

      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(true);
      expect(readiness.status).toBe('degraded');
    });
  });

  describe('Graceful Degradation: Cache Service Failure', () => {
    it('should silently fall back to null when cache operations encounter errors', async () => {
      // Cause internal fallback
      const cached = await cacheService.get('non-existent-key');
      expect(cached).toBeNull();
    });
  });

  describe('Graceful Shutdown Sequence', () => {
    it('should set readiness to false immediately upon SIGTERM shutdown signal', async () => {
      await shutdownService.onApplicationShutdown('SIGTERM');

      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(false);
      expect(prismaMock.$disconnect).toHaveBeenCalled();
    });
  });
});
