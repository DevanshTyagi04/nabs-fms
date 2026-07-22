import { DocsController } from './docs.controller';
import { ErrorCatalogService } from './errors/error-catalog.service';
import { PostmanService } from './postman/postman.service';
import { SdkService } from './sdk/sdk.service';

describe('API Documentation, Developer Experience & SDK Module (Phase 17 Unit Tests)', () => {
  let postmanService: PostmanService;
  let sdkService: SdkService;
  let errorCatalogService: ErrorCatalogService;
  let docsController: DocsController;

  const mockOpenApiDoc = {
    info: {
      title: 'NABS FSM API',
      version: '1.0.0',
      description: 'Test API Description',
    },
    paths: {
      '/api/v1/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Authentication & Identity'],
        },
      },
      '/api/v1/service-requests': {
        get: {
          summary: 'List Service Requests',
          tags: ['Service Request Management'],
        },
      },
    },
  };

  beforeEach(() => {
    postmanService = new PostmanService();
    sdkService = new SdkService();
    errorCatalogService = new ErrorCatalogService();
    docsController = new DocsController(postmanService, sdkService, errorCatalogService);

    docsController.setOpenApiDocument(mockOpenApiDoc);
  });

  describe('ErrorCatalogService', () => {
    it('should return complete error catalog for HTTP 400, 401, 403, 404, 409, 422, 429, 500 status codes', () => {
      const catalog = errorCatalogService.getErrorCatalog();
      const statusCodes = catalog.map((c) => c.statusCode);

      expect(statusCodes).toContain(400);
      expect(statusCodes).toContain(401);
      expect(statusCodes).toContain(403);
      expect(statusCodes).toContain(404);
      expect(statusCodes).toContain(409);
      expect(statusCodes).toContain(422);
      expect(statusCodes).toContain(429);
      expect(statusCodes).toContain(500);

      const badRequestEntry = catalog.find((c) => c.statusCode === 400);
      expect(badRequestEntry?.possibleCauses.length).toBeGreaterThan(0);
      expect(badRequestEntry?.recommendedAction).toBeDefined();
    });
  });

  describe('PostmanService (OpenAPI to Postman Collection v2.1)', () => {
    it('should convert OpenAPI document into valid Postman Collection v2.1 JSON structure', () => {
      const collection = postmanService.generatePostmanCollection(mockOpenApiDoc);

      expect(collection.info.name).toBe('NABS FSM API');
      expect(collection.info.schema).toContain('collection.json');
      expect(collection.variable).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'baseUrl' }),
          expect.objectContaining({ key: 'bearerToken' }),
        ]),
      );

      expect(collection.item.length).toBeGreaterThan(0);
      const authFolder = collection.item.find((i: any) => i.name === 'Authentication & Identity');
      expect(authFolder).toBeDefined();
    });
  });

  describe('SdkService (TypeScript Client SDK Generator)', () => {
    it('should generate typed TypeScript Client SDK source code with version metadata', () => {
      const sdkCode = sdkService.generateTypeScriptSdk(mockOpenApiDoc);

      expect(sdkCode).toContain('API Version: 1.0.0');
      expect(sdkCode).toContain('export class NabsClient');
      expect(sdkCode).toContain('public readonly auth = {');
      expect(sdkCode).toContain('public readonly serviceRequests = {');
      expect(sdkCode).toContain('public readonly health = {');
    });
  });

  describe('DocsController (DX Endpoints)', () => {
    it('should expose OpenAPI JSON endpoint', () => {
      const doc = docsController.getOpenApiDocument();
      expect(doc.info.title).toBe('NABS FSM API');
    });

    it('should expose Postman Collection JSON endpoint', () => {
      const col = docsController.getPostmanCollection();
      expect(col.info.name).toBe('NABS FSM API');
    });

    it('should expose TypeScript SDK source endpoint', () => {
      const sdk = docsController.getTypeScriptSdk();
      expect(sdk).toContain('export class NabsClient');
    });

    it('should expose Error Catalog endpoint', () => {
      const errors = docsController.getErrorCatalog();
      expect(errors.length).toBeGreaterThan(5);
    });

    it('should expose Developer Getting Started Guide endpoint', () => {
      const guide = docsController.getDeveloperGuide();
      expect(guide.title).toContain('Getting Started Guide');
      expect(guide.sections.authentication).toBeDefined();
    });
  });
});
