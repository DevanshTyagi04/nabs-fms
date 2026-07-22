import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { ActivityService } from './activity.service';
import { AdminActivityController } from './controllers/admin-activity.controller';
import { CustomerActivityController } from './controllers/customer-activity.controller';
import { VendorActivityController } from './controllers/vendor-activity.controller';
import { EntityHistoryService } from './history/entity-history.service';
import { ActivityTimelineService } from './timeline/activity-timeline.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminActivityController,
    CustomerActivityController,
    VendorActivityController,
  ],
  providers: [
    ActivityService,
    ActivityTimelineService,
    EntityHistoryService,
  ],
  exports: [
    ActivityService,
    ActivityTimelineService,
    EntityHistoryService,
  ],
})
export class ActivityModule {}
