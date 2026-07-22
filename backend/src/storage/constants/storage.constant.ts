export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER_TOKEN';

export const STORAGE_CATEGORY = {
  AVATAR: 'avatars',
  ATTACHMENT: 'attachments',
  INVOICE: 'invoices',
  TEMP: 'temp',
} as const;

export const MAX_FILE_SIZE_BYTES = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  INVOICE: 10 * 1024 * 1024, // 10MB
  ATTACHMENT: 25 * 1024 * 1024, // 25MB
} as const;

export const ALLOWED_MIME_TYPES = {
  AVATAR: ['image/jpeg', 'image/png', 'image/webp'],
  INVOICE: ['application/pdf', 'text/html'],
  ATTACHMENT: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;
