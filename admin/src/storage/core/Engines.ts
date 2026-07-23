import { Asset, AssetConfig, UploadSession } from './types';

export class AssetRegistry {
  private static categoryMap: Record<string, AssetConfig> = {
    avatars: {
      category: 'avatars',
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      isPreviewable: true,
      isDownloadable: true,
    },
    attachments: {
      category: 'attachments',
      maxSizeBytes: 25 * 1024 * 1024, // 25MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'],
      isPreviewable: true,
      isDownloadable: true,
    },
    invoices: {
      category: 'invoices',
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['application/pdf'],
      isPreviewable: true,
      isDownloadable: true,
    },
    temp: {
      category: 'temp',
      maxSizeBytes: 10 * 1024 * 1024,
      allowedMimeTypes: ['*/*'],
      isPreviewable: false,
      isDownloadable: true,
    },
  };

  static getConfig(category: string): AssetConfig {
    return (
      this.categoryMap[category] || {
        category,
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: ['*/*'],
        isPreviewable: true,
        isDownloadable: true,
      }
    );
  }

  static isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  static isPdf(contentType: string): boolean {
    return contentType === 'application/pdf';
  }
}

export class UploadEngine {
  static createSession(fileName: string, category: string, file: any): UploadSession {
    return {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      fileName,
      category,
      progress: 0,
      status: 'QUEUED',
      startedAt: new Date().toISOString(),
    };
  }
}

export class PreviewEngine {
  static getViewerType(contentType: string): 'IMAGE' | 'PDF' | 'DOCUMENT' | 'UNKNOWN' {
    if (AssetRegistry.isImage(contentType)) return 'IMAGE';
    if (AssetRegistry.isPdf(contentType)) return 'PDF';
    return 'UNKNOWN';
  }
}

export class StorageEngine {
  static evaluateAsset(asset: Asset) {
    const config = AssetRegistry.getConfig(asset.category);
    const viewerType = PreviewEngine.getViewerType(asset.contentType);

    return {
      config,
      viewerType,
      formattedSize: (asset.size / (1024 * 1024)).toFixed(2) + ' MB',
    };
  }
}
