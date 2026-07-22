import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CleanupService } from './cleanup/cleanup.service';
import { STORAGE_PROVIDER_TOKEN } from './constants/storage.constant';
import { DownloadService } from './download/download.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    LocalStorageProvider,
    S3StorageProvider,
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: (
        configService: ConfigService,
        localStorage: LocalStorageProvider,
        s3Storage: S3StorageProvider,
      ) => {
        const providerType = configService.get<string>('STORAGE_PROVIDER')?.toLowerCase();
        return providerType === 's3' || providerType === 'aws' ? s3Storage : localStorage;
      },
      inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
    },
    UploadService,
    DownloadService,
    CleanupService,
    StorageService,
  ],
  exports: [
    StorageService,
    UploadService,
    DownloadService,
    CleanupService,
    STORAGE_PROVIDER_TOKEN,
  ],
})
export class StorageModule {}
