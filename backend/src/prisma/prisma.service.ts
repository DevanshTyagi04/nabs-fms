import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: pg.Pool;

  constructor(configService: ConfigService) {
    const connectionString =
      configService?.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured in environment variables');
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    this.logger.log('Connecting to Neon PostgreSQL via Prisma 7 Driver Adapter...');
    await this.$connect();
    this.logger.log('Successfully connected to Neon PostgreSQL.');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting Prisma Client and closing PostgreSQL connection pool...');
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Database connections closed gracefully.');
  }
}
