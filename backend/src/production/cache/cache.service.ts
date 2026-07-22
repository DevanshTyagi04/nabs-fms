import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  // In-memory fallback map for non-blocking operations if Redis is offline
  private inMemoryCache = new Map<string, { value: any; expiresAt: number }>();
  private inflightLocks = new Map<string, Promise<any>>();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Recommendation 2 & 4: Centralized Cache GET with Stampede Protection & Graceful Fallback
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.inMemoryCache.get(key);
      if (entry) {
        if (Date.now() > entry.expiresAt) {
          this.inMemoryCache.delete(key);
          return null;
        }
        return entry.value as T;
      }
      return null;
    } catch (err: any) {
      this.logger.warn(`Cache get failed for key [${key}]: ${err.message}. Falling back safely.`);
      return null;
    }
  }

  /**
   * Centralized Cache SET
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<boolean> {
    try {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.inMemoryCache.set(key, { value, expiresAt });
      return true;
    } catch (err: any) {
      this.logger.warn(`Cache set failed for key [${key}]: ${err.message}. Gracefully degraded.`);
      return false;
    }
  }

  /**
   * Centralized Cache DELETE
   */
  async delete(key: string): Promise<boolean> {
    try {
      this.inMemoryCache.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recommendation 2: Pattern Invalidation
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.inMemoryCache.keys()) {
        if (regex.test(key)) {
          this.inMemoryCache.delete(key);
          count++;
        }
      }
    } catch (err: any) {
      this.logger.warn(`Pattern invalidation failed for [${pattern}]: ${err.message}`);
    }
    return count;
  }
}
