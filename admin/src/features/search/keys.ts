export const searchKeys = {
  all: ['search'] as const,
  lists: () => [...searchKeys.all, 'list'] as const,
  list: (query: string, scope: string) => [...searchKeys.lists(), query, scope] as const,
};
