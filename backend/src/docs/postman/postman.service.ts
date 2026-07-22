import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PostmanService {
  private readonly logger = new Logger(PostmanService.name);

  /**
   * Recommendation 1: Converts OpenAPI specification into Postman Collection v2.1 format
   */
  generatePostmanCollection(openApiDocument: any): Record<string, any> {
    const info = {
      name: openApiDocument.info?.title || 'NABS Field Service Management API',
      description: openApiDocument.info?.description || 'Exported Postman Collection v2.1',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      version: openApiDocument.info?.version || '1.0.0',
    };

    const variables = [
      { key: 'baseUrl', value: 'http://localhost:3000', type: 'string' },
      { key: 'bearerToken', value: '', type: 'string' },
    ];

    const folderMap = new Map<string, any[]>();

    if (openApiDocument.paths) {
      for (const [pathUrl, pathItem] of Object.entries<any>(openApiDocument.paths)) {
        for (const [method, operation] of Object.entries<any>(pathItem)) {
          const tag = operation.tags && operation.tags[0] ? operation.tags[0] : 'General';
          if (!folderMap.has(tag)) {
            folderMap.set(tag, []);
          }

          const requestItem = {
            name: operation.summary || `${method.toUpperCase()} ${pathUrl}`,
            request: {
              method: method.toUpperCase(),
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{bearerToken}}' },
              ],
              url: {
                raw: `{{baseUrl}}${pathUrl}`,
                host: ['{{baseUrl}}'],
                path: pathUrl.split('/').filter(Boolean),
              },
              description: operation.description || operation.summary || '',
            },
            response: [],
          };

          folderMap.get(tag)?.push(requestItem);
        }
      }
    }

    const itemFolderArray = Array.from(folderMap.entries()).map(([folderName, items]) => ({
      name: folderName,
      item: items,
    }));

    return {
      info,
      item: itemFolderArray,
      variable: variables,
    };
  }
}
