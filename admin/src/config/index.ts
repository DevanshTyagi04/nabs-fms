export const config = {
  appName: 'NABS Admin Console',
  version: '1.0.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  theme: {
    defaultMode: 'system' as const,
    storageKey: 'nabs_admin_theme',
  },
};
