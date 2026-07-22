import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { StorageModule } from '../storage';
import { AdminServiceRequestController } from './admin-service-requests.controller';
import { RequestAttachmentService } from './attachment/request-attachment.service';
import { VendorAssignmentService } from './assignment/vendor-assignment.service';
import { ServiceRequestController } from './service-requests.controller';
import { ServiceRequestService } from './service-requests.service';
import { RequestStateService } from './state-machine/request-state.service';
import { VendorServiceRequestController } from './vendor-service-requests.controller';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [
    ServiceRequestController,
    AdminServiceRequestController,
    VendorServiceRequestController,
  ],
  providers: [
    ServiceRequestService,
    RequestStateService,
    VendorAssignmentService,
    RequestAttachmentService,
  ],
  exports: [
    ServiceRequestService,
    RequestStateService,
    VendorAssignmentService,
    RequestAttachmentService,
  ],
})
export class ServiceRequestsModule {}
