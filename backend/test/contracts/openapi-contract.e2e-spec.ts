import { createOpenApiConfig } from '../../src/docs/swagger/swagger.config';

describe('Phase 18: API Contract & OpenAPI Specification Quality Gate', () => {
  it('should generate valid OpenAPI 3.0 DocumentBuilder AST configuration', () => {
    const config = createOpenApiConfig();

    expect(config.info.title).toContain('NABS Field Service Management');
    expect(config.info.version).toBe('1.0.0');

    // Verify security scheme definition
    expect(config.components?.securitySchemes).toBeDefined();
    const bearerScheme: any = config.components?.securitySchemes?.['JWT-auth'];
    expect(bearerScheme).toBeDefined();
    expect(bearerScheme.type).toBe('http');
    expect(bearerScheme.scheme).toBe('bearer');

    // Verify mandatory domain tags
    const tagNames = config.tags?.map((t) => t.name) || [];
    expect(tagNames).toContain('Authentication & Identity');
    expect(tagNames).toContain('Service Request Management');
    expect(tagNames).toContain('Work Order Execution');
    expect(tagNames).toContain('Payment Management');
    expect(tagNames).toContain('Invoice Management');
    expect(tagNames).toContain('Production Operational Readiness & Health');
  });
});
