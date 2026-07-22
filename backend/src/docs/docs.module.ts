import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { ErrorCatalogService } from './errors/error-catalog.service';
import { PostmanService } from './postman/postman.service';
import { SdkService } from './sdk/sdk.service';

@Module({
  controllers: [DocsController],
  providers: [
    PostmanService,
    SdkService,
    ErrorCatalogService,
  ],
  exports: [
    PostmanService,
    SdkService,
    ErrorCatalogService,
  ],
})
export class DocsModule {}
