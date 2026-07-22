import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  // Low-cardinality metric counters
  private httpRequestsTotal = new Map<string, number>();
  private errorCountTotal = new Map<string, number>();
  private dbQueriesTotal = 0;
  private queueJobsTotal = new Map<string, number>();
  private storageOpsTotal = new Map<string, number>();
  private authAttemptsTotal = new Map<string, number>();

  /**
   * Recommendation 3: Low-cardinality HTTP request counter
   */
  recordHttpRequest(method: string, statusCode: number) {
    try {
      const key = `${method.toUpperCase()}::${statusCode}`;
      const count = this.httpRequestsTotal.get(key) || 0;
      this.httpRequestsTotal.set(key, count + 1);
    } catch {
      // Recommendation 4: Graceful degradation - never affect request handling
    }
  }

  recordError(errorType: string) {
    try {
      const count = this.errorCountTotal.get(errorType) || 0;
      this.errorCountTotal.set(errorType, count + 1);
    } catch {}
  }

  recordDbQuery() {
    this.dbQueriesTotal++;
  }

  recordQueueJob(queueName: string, status: 'enqueued' | 'completed' | 'failed') {
    try {
      const key = `${queueName}::${status}`;
      const count = this.queueJobsTotal.get(key) || 0;
      this.queueJobsTotal.set(key, count + 1);
    } catch {}
  }

  recordStorageOp(operation: 'upload' | 'download' | 'delete', provider: string) {
    try {
      const key = `${provider}::${operation}`;
      const count = this.storageOpsTotal.get(key) || 0;
      this.storageOpsTotal.set(key, count + 1);
    } catch {}
  }

  recordAuthAttempt(status: 'success' | 'failure') {
    try {
      const count = this.authAttemptsTotal.get(status) || 0;
      this.authAttemptsTotal.set(status, count + 1);
    } catch {}
  }

  /**
   * Renders metrics formatted for Prometheus scrapers
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    lines.push('# HELP http_requests_total Total number of HTTP requests processed');
    lines.push('# TYPE http_requests_total counter');
    for (const [key, count] of this.httpRequestsTotal.entries()) {
      const [method, statusCode] = key.split('::');
      lines.push(`http_requests_total{method="${method}",status_code="${statusCode}"} ${count}`);
    }

    lines.push('# HELP error_count_total Total error count by type');
    lines.push('# TYPE error_count_total counter');
    for (const [errorType, count] of this.errorCountTotal.entries()) {
      lines.push(`error_count_total{type="${errorType}"} ${count}`);
    }

    lines.push('# HELP db_queries_total Total database queries executed');
    lines.push('# TYPE db_queries_total counter');
    lines.push(`db_queries_total ${this.dbQueriesTotal}`);

    lines.push('# HELP queue_jobs_total Total background queue jobs processed');
    lines.push('# TYPE queue_jobs_total counter');
    for (const [key, count] of this.queueJobsTotal.entries()) {
      const [queueName, status] = key.split('::');
      lines.push(`queue_jobs_total{queue_name="${queueName}",status="${status}"} ${count}`);
    }

    lines.push('# HELP storage_operations_total Total storage operations executed');
    lines.push('# TYPE storage_operations_total counter');
    for (const [key, count] of this.storageOpsTotal.entries()) {
      const [provider, op] = key.split('::');
      lines.push(`storage_operations_total{provider="${provider}",operation="${op}"} ${count}`);
    }

    lines.push('# HELP auth_attempts_total Total authentication attempts');
    lines.push('# TYPE auth_attempts_total counter');
    for (const [status, count] of this.authAttemptsTotal.entries()) {
      lines.push(`auth_attempts_total{status="${status}"} ${count}`);
    }

    return lines.join('\n') + '\n';
  }
}
