import { CacheService } from './cache/cache.service';
import { DiagnosticsService } from './diagnostics/diagnostics.service';
import { HealthService } from './health/health.service';
import { MetricsService } from './metrics/metrics.service';
import { ShutdownService } from './shutdown/shutdown.service';
import { TracingService } from './tracing/tracing.service';

describe('Production Hardening & Operational Readiness Module (Phase 16 Unit & Integration Tests)', () => {
  let healthService: HealthService;
  let metricsService: MetricsService;
  let cacheService: CacheService;
  let tracingService: TracingService;
  let diagnosticsService: DiagnosticsService;
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
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        return null;
      }),
    };

    storageMock = {
      checkHealth: jest.fn().mockResolvedValue({ isHealthy: true }),
    };

    healthService = new HealthService(prismaMock, configMock, storageMock);
    metricsService = new MetricsService();
    cacheService = new CacheService(configMock);
    tracingService = new TracingService(configMock);
    diagnosticsService = new DiagnosticsService(configMock);
    shutdownService = new ShutdownService(healthService, prismaMock);
  });

  describe('HealthService (Critical vs Optional Probes & Liveness/Readiness)', () => {
    it('should return liveness status overview', () => {
      const live = healthService.getLiveness();
      expect(live.status).toBe('ok');
      expect(live.timestamp).toBeDefined();
    });

    it('should pass readiness when critical PostgreSQL probe succeeds', async () => {
      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(true);
      expect(readiness.status).toBe('ok');
      expect(readiness.dependencies.postgres.status).toBe('up');
    });

    it('should fail readiness (isReady: false) when critical PostgreSQL probe fails', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('DB Connection Refused'));

      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(false);
      expect(readiness.status).toBe('down');
      expect(readiness.dependencies.postgres.status).toBe('down');
    });

    it('should report degraded state if optional Storage probe fails while PostgreSQL remains healthy', async () => {
      storageMock.checkHealth.mockResolvedValue({ isHealthy: false });

      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(true); // Still ready because Storage is optional
      expect(readiness.status).toBe('degraded');
    });

    it('should set readiness to false during active shutdown', async () => {
      healthService.setShuttingDown(true);
      const readiness = await healthService.getReadiness();
      expect(readiness.isReady).toBe(false);
    });
  });

  describe('MetricsService (Low-Cardinality Prometheus Exporter)', () => {
    it('should record low-cardinality HTTP requests and generate Prometheus text format', () => {
      metricsService.recordHttpRequest('GET', 200);
      metricsService.recordHttpRequest('POST', 201);
      metricsService.recordDbQuery();
      metricsService.recordQueueJob('QUEUE_NOTIFICATION', 'completed');

      const prometheusOutput = metricsService.getPrometheusMetrics();

      expect(prometheusOutput).toContain('http_requests_total{method="GET",status_code="200"} 1');
      expect(prometheusOutput).toContain('http_requests_total{method="POST",status_code="201"} 1');
      expect(prometheusOutput).toContain('db_queries_total 1');
      expect(prometheusOutput).toContain('queue_jobs_total{queue_name="QUEUE_NOTIFICATION",status="completed"} 1');
    });
  });

  describe('CacheService (Memory Fallback & Invalidation)', () => {
    it('should set, get, and delete cache keys cleanly', async () => {
      await cacheService.set('test:key', { data: 'value' }, 60);
      const cached = await cacheService.get<any>('test:key');

      expect(cached).toEqual({ data: 'value' });

      await cacheService.delete('test:key');
      const empty = await cacheService.get<any>('test:key');
      expect(empty).toBeNull();
    });

    it('should invalidate keys matching wildcards', async () => {
      await cacheService.set('reports:admin:1', 'R1', 60);
      await cacheService.set('reports:admin:2', 'R2', 60);
      await cacheService.set('users:1', 'U1', 60);

      const count = await cacheService.invalidatePattern('reports:admin:*');
      expect(count).toBe(2);

      expect(await cacheService.get('reports:admin:1')).toBeNull();
      expect(await cacheService.get('users:1')).toBe('U1');
    });
  });

  describe('DiagnosticsService (Operational System Info)', () => {
    it('should return memory, CPU, Node version, and process uptime stats', () => {
      const diag = diagnosticsService.getDiagnostics();
      expect(diag.version).toBe('1.0.0');
      expect(diag.nodeVersion).toBeDefined();
      expect(diag.memoryUsage.rssMB).toBeGreaterThan(0);
      expect(diag.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ShutdownService (Graceful Termination)', () => {
    it('should mark readiness NOT READY and disconnect Prisma cleanly on shutdown', async () => {
      const spy = jest.spyOn(healthService, 'setShuttingDown');

      await shutdownService.onApplicationShutdown('SIGTERM');

      expect(spy).toHaveBeenCalledWith(true);
      expect(prismaMock.$disconnect).toHaveBeenCalled();
    });
  });
});
