export const activityKeys = {
  all: ['activity'] as const,
  timelines: () => [...activityKeys.all, 'timeline'] as const,
  timeline: (filters: Record<string, any>) => [...activityKeys.timelines(), filters] as const,
  entityHistories: () => [...activityKeys.all, 'entityHistory'] as const,
  entityHistory: (entity: string, id: string) => [...activityKeys.entityHistories(), entity, id] as const,
};
