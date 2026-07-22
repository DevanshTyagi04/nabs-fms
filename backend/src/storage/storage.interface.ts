export interface UploadedFileMeta {
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileSize: number;
}

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER_TOKEN';

export interface IStorageProvider {
  uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder?: string,
  ): Promise<UploadedFileMeta>;

  deleteFile(fileUrlOrKey: string): Promise<boolean>;

  getFileUrl(fileKey: string): Promise<string>;
}
