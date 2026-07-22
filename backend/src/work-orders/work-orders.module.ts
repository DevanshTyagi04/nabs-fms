import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma';
import { ServiceRequestsModule } from '../service-requests';
import { StorageModule } from '../storage';
import { AdminWorkOrderController } from './admin-work-orders.controller';
import { WorkOrderAttachmentService } from './attachment/work-order-attachment.service';
import { CustomerWorkOrderController } from './customer-work-orders.controller';
import { WorkLogService } from './logs/work-log.service';
import { WorkOrderStateService } from './state/work-order-state.service';
import { WorkTaskService } from './tasks/work-task.service';
import { VendorWorkOrderController } from './vendor-work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    ServiceRequestsModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
    }),
  ],
  controllers: [
    VendorWorkOrderController,
    AdminWorkOrderController,
    CustomerWorkOrderController,
  ],
  providers: [
    WorkOrdersService,
    WorkOrderStateService,
    WorkTaskService,
    WorkLogService,
    WorkOrderAttachmentService,
  ],
  exports: [
    WorkOrdersService,
    WorkOrderStateService,
    WorkTaskService,
    WorkLogService,
    WorkOrderAttachmentService,
  ],
})
export class WorkOrdersModule {}
