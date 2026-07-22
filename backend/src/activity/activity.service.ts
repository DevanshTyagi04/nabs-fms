import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma';
import { QueryActivityDto } from './dto';
import { EntityHistoryService } from './history/entity-history.service';
import { ActivityItem, NormalizedActivityFeedResponse } from './interfaces/activity.interface';
import { ActivityTimelineService, UserContext } from './timeline/activity-timeline.service';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: ActivityTimelineService,
    private readonly historyService: EntityHistoryService,
  ) {}

  /**
   * Resolves UserContext (CustomerProfileId / VendorProfileId) for role-based ownership scoping
   */
  private async resolveUserContext(userId: string): Promise<UserContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        customerProfile: { select: { id: true } },
        vendorProfile: { select: { id: true } },
      },
    });

    return {
      userId,
      role: user?.role || UserRole.CUSTOMER,
      customerProfileId: user?.customerProfile?.id,
      vendorProfileId: user?.vendorProfile?.id,
    };
  }

  /**
   * Retrieves role-scoped chronological activity timeline feed
   */
  async getActivityTimeline(userId: string, dto: QueryActivityDto): Promise<NormalizedActivityFeedResponse> {
    const userContext = await this.resolveUserContext(userId);
    return this.timelineService.getTimeline(dto, userContext);
  }

  /**
   * Retrieves complete lifecycle history for a single entity instance
   */
  async getEntityHistory(entity: string, entityId: string): Promise<ActivityItem[]> {
    return this.historyService.getEntityHistory(entity, entityId);
  }
}
