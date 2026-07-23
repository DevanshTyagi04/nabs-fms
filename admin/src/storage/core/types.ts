export interface Asset {
  id: string;
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  category: 'avatars' | 'attachments' | 'invoices' | 'temp';
  publicUrl?: string;
  createdAt?: string;
}

export interface AssetConfig {
  category: string;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  isPreviewable: boolean;
  isDownloadable: boolean;
}

export interface UploadSession {
  sessionId: string;
  file: File | Blob | any;
  fileName: string;
  category: string;
  progress: number;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface AssetLink {
  assetId: string;
  entityType: 'SERVICE_REQUEST' | 'SURVEY' | 'WORK_ORDER' | 'INVOICE' | 'PAYMENT' | 'USER';
  entityId: string;
  relationType: 'ATTACHMENT' | 'INSPECTION_PHOTO' | 'PROOF_OF_WORK' | 'INVOICE_PDF' | 'RECEIPT_PDF' | 'AVATAR';
  uploadedBy: string;
  uploadedAt: string;
}
