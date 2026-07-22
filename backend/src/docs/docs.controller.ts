import { Controller, Get, Header, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { ErrorCatalogService } from './errors/error-catalog.service';
import { PostmanService } from './postman/postman.service';
import { SdkService } from './sdk/sdk.service';

@ApiTags('Developer Experience & API Documentation')
@Controller('docs')
export class DocsController {
  private openApiDocument: any;

  constructor(
    private readonly postmanService: PostmanService,
    private readonly sdkService: SdkService,
    private readonly errorCatalogService: ErrorCatalogService,
  ) {}

  setOpenApiDocument(doc: any) {
    this.openApiDocument = doc;
  }

  @Public()
  @Get('openapi.json')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download Canonical OpenAPI 3.0 Specification (JSON)' })
  @ApiResponse({ status: 200, description: 'OpenAPI specification JSON returned.' })
  getOpenApiDocument() {
    return this.openApiDocument || { info: { title: 'NABS FSM API', version: '1.0.0' }, paths: {} };
  }

  @Public()
  @Get('postman.json')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export Generated Postman Collection v2.1 (JSON)' })
  @ApiResponse({ status: 200, description: 'Postman collection JSON returned.' })
  getPostmanCollection() {
    const doc = this.getOpenApiDocument();
    return this.postmanService.generatePostmanCollection(doc);
  }

  @Public()
  @Get('sdk')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="nabs-client-sdk.ts"')
  @ApiOperation({ summary: 'Download Strongly Typed TypeScript Client SDK Source File' })
  @ApiResponse({ status: 200, description: 'TypeScript SDK source file returned.' })
  getTypeScriptSdk(): string {
    const doc = this.getOpenApiDocument();
    return this.sdkService.generateTypeScriptSdk(doc);
  }

  @Public()
  @Get('errors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve Standardized HTTP Error Catalog (400-500)' })
  @ApiResponse({ status: 200, description: 'HTTP Error catalog returned.' })
  getErrorCatalog() {
    return this.errorCatalogService.getErrorCatalog();
  }

  @Public()
  @Get('guide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Developer Getting Started Guide' })
  @ApiResponse({ status: 200, description: 'Developer guide returned.' })
  getDeveloperGuide() {
    return {
      title: 'NABS Field Service Management API - Getting Started Guide',
      version: '1.0.0',
      overview: 'Welcome to the NABS FSM Backend Platform API. This guide provides onboarding steps for client integration.',
      sections: {
        authentication: {
          step1: 'POST /api/v1/auth/login with email & password to obtain accessToken and refreshToken.',
          step2: 'Include Authorization header: "Bearer <accessToken>" on all authenticated HTTP requests.',
          step3: 'When accessToken expires (401), POST /api/v1/auth/refresh-token to acquire a new accessToken without re-login.',
        },
        paginationAndFiltering: {
          description: 'All list endpoints support page (default 1) and limit (default 10, max 100) query parameters.',
          envelope: 'Responses return { items: [...], pagination: { page, pageSize, totalItems, totalPages, hasNextPage, hasPrevPage } }.',
        },
        fileUploads: {
          step1: 'POST /api/v1/storage/upload with multipart form or stream data.',
          step2: 'Max limits: Avatar 5MB, Attachments 25MB, Invoices 10MB.',
        },
        errorHandling: {
          catalogEndpoint: 'GET /api/v1/docs/errors for full 400-500 HTTP code catalog.',
          format: 'Errors return { statusCode, error, message, timestamp, requestId }.',
        },
      },
    };
  }
}
