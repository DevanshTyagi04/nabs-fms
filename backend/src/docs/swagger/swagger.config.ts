import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiConfig() {
  return new DocumentBuilder()
    .setTitle('NABS Field Service Management Platform API')
    .setDescription(
      'Enterprise FSM Platform Backend API Specification. Built with NestJS, Prisma 7, PostgreSQL, Redis, and BullMQ.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication & Identity', 'User login, token refresh, logout, session management')
    .addTag('User & Profile Management', 'Customer, Vendor, and Admin profile operations')
    .addTag('Service Request Management', 'Lifecycle management for customer service requests')
    .addTag('Survey Management', 'Vendor survey submissions & versioning')
    .addTag('Estimate Quotation Management', 'Quotation estimates & financial approval workflows')
    .addTag('Work Order Execution', 'Work order assignment, scheduling, execution, and verification')
    .addTag('Payment Management', 'Payment gateway initiation, HMAC signature verification, webhooks')
    .addTag('Invoice Management', 'Invoice generation, financial immutability, PDF rendering')
    .addTag('Notification Management', 'Multi-channel notification dispatcher & recipient preferences')
    .addTag('Reporting & Analytics', 'Read-only business intelligence dashboards (Admin, Vendor, Customer)')
    .addTag('Search & Global Filtering', 'Centralized search & global multi-field filtering engine')
    .addTag('Background Jobs & Scheduler', 'BullMQ asynchronous background job processing & scheduling')
    .addTag('File & Storage Management', 'Provider-agnostic streaming file uploads/downloads & cleanup')
    .addTag('Audit & Activity Center', 'Centralized chronological activity feeds & entity history')
    .addTag('Production Operational Readiness & Health', 'Liveness/readiness probes, Prometheus metrics, diagnostics')
    .build();
}
