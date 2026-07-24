export const syncKeys = {
  all: ['sync'] as const,
  queues: () => [...syncKeys.all, 'queue'] as const,
  queueStats: () => [...syncKeys.queues(), 'stats'] as const,
  conflicts: () => [...syncKeys.all, 'conflicts'] as const,
};
