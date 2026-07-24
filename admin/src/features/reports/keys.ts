export const reportsKeys = {
  all: ['reports'] as const,
  dashboards: () => [...reportsKeys.all, 'dashboard'] as const,
  dashboard: (timeRange: string) => [...reportsKeys.dashboards(), timeRange] as const,
  analytics: () => [...reportsKeys.all, 'analytics'] as const,
};
