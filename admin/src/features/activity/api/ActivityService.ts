import { ActivityRepository } from './ActivityRepository';
import { ActivityFilters, ActivityListResult, TimelineItemDomain } from '../types';

export class ActivityService {
  static async getAdminTimeline(filters: ActivityFilters): Promise<ActivityListResult> {
    return ActivityRepository.getAdminTimeline(filters);
  }

  static async getEntityHistory(entity: string, entityId: string): Promise<TimelineItemDomain[]> {
    return ActivityRepository.getEntityHistory(entity, entityId);
  }
}
