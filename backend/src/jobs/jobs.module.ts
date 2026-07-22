import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth';
import { InvoicesModule } from '../invoices';
import { NotificationsModule } from '../notifications';
import { PrismaModule } from '../prisma';
import { AdminJobController } from './admin-jobs.controller';
import { JobsService } from './jobs.service';
import { CleanupProcessor } from './processors/cleanup.processor';
import { InvoiceProcessor } from './processors/invoice.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueService } from './queues/queue.service';
import { SchedulerService } from './scheduler/scheduler.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    NotificationsModule,
    InvoicesModule,
    AuthModule,
  ],
  controllers: [AdminJobController],
  providers: [
    JobsService,
    QueueService,
    SchedulerService,
    NotificationProcessor,
    InvoiceProcessor,
    PaymentProcessor,
    CleanupProcessor,
  ],
  exports: [
    JobsService,
    QueueService,
    SchedulerService,
  ],
})
export class JobsModule {}
