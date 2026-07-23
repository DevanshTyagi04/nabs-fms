export const storageKeys = {
  all: ['storage'] as const,
  lists: () => [...storageKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...storageKeys.lists(), filters] as const,
  signedUrl: (key: string) => [...storageKeys.all, 'signedUrl', key] as const,
  details: () => [...storageKeys.all, 'detail'] as const,
  detail: (id: string) => [...storageKeys.details(), id] as const,
};
