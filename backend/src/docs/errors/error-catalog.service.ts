import { Injectable } from '@nestjs/common';

export interface ErrorCatalogEntry {
  statusCode: number;
  error: string;
  description: string;
  possibleCauses: string[];
  recommendedAction: string;
  sampleResponseBody: Record<string, any>;
}

@Injectable()
export class ErrorCatalogService {
  getErrorCatalog(): ErrorCatalogEntry[] {
    return [
      {
        statusCode: 400,
        error: 'Bad Request',
        description: 'Input validation failed or request payload formatting is invalid.',
        possibleCauses: [
          'Missing required fields in body',
          'Field type mismatch (e.g. string passed instead of number)',
          'String length or array bounds exceeded',
          'Invalid enum parameter value',
        ],
        recommendedAction: 'Inspect the "message" field in response for validation errors and fix request payload.',
        sampleResponseBody: {
          statusCode: 400,
          error: 'Bad Request',
          message: ['email must be an email', 'password must be longer than 8 characters'],
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 401,
        error: 'Unauthorized',
        description: 'Authentication token is missing, expired, invalid, or revoked.',
        possibleCauses: [
          'Authorization header missing or formatted incorrectly',
          'JWT access token expired',
          'JWT signature verification failed',
          'Token has been explicitly revoked after logout',
        ],
        recommendedAction: 'Authenticate via /api/v1/auth/login or use /api/v1/auth/refresh-token to obtain a fresh access token.',
        sampleResponseBody: {
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Access token expired or invalid',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 403,
        error: 'Forbidden',
        description: 'Authenticated user lacks required role or ownership permissions for resource.',
        possibleCauses: [
          'CUSTOMER attempting to access ADMIN endpoints',
          'VENDOR attempting to modify unassigned Work Orders',
          'User accessing another user profile data',
        ],
        recommendedAction: 'Ensure user account has necessary RBAC role permissions or resource ownership.',
        sampleResponseBody: {
          statusCode: 403,
          error: 'Forbidden',
          message: 'User does not possess required ADMIN role',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 404,
        error: 'Not Found',
        description: 'Requested entity instance, endpoint path, or file key does not exist.',
        possibleCauses: [
          'Invalid entity UUID in URL parameter',
          'Resource has been soft-deleted',
          'Storage object key missing from bucket/disk',
        ],
        recommendedAction: 'Verify entity ID exists before sending request.',
        sampleResponseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'ServiceRequest not found: [sr-uuid-123]',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 409,
        error: 'Conflict',
        description: 'State transition violation, version conflict, or unique constraint duplicate.',
        possibleCauses: [
          'Illegal state machine status transition',
          'Duplicate email/phone registration attempt',
          'Optimistic concurrency version mismatch',
        ],
        recommendedAction: 'Fetch current entity state or use new unique identifiers.',
        sampleResponseBody: {
          statusCode: 409,
          error: 'Conflict',
          message: 'Invalid request status transition from [COMPLETED] to [CREATED]',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 422,
        error: 'Unprocessable Entity',
        description: 'Semantic business rule validation failed despite syntactically valid JSON.',
        possibleCauses: [
          'Payment amount mismatch during Razorpay webhook verification',
          'Survey submission without valid line items',
          'Invoice issued for non-successful payment',
        ],
        recommendedAction: 'Verify domain preconditions before calling operation.',
        sampleResponseBody: {
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Cannot issue invoice for payment in PENDING status',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 429,
        error: 'Too Many Requests',
        description: 'Client rate limit exceeded.',
        possibleCauses: [
          'Exceeded 100 requests per minute limit',
        ],
        recommendedAction: 'Pause request execution until rate limit window resets.',
        sampleResponseBody: {
          statusCode: 429,
          error: 'Too Many Requests',
          message: 'ThrottlerException: Limit exceeded',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
      {
        statusCode: 500,
        error: 'Internal Server Error',
        description: 'Unexpected server-side error or infrastructure failure.',
        possibleCauses: [
          'Database connectivity failure',
          'Unhandled exception',
        ],
        recommendedAction: 'Retry request with exponential backoff and report persistent errors to platform administrator.',
        sampleResponseBody: {
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An unexpected internal error occurred',
          timestamp: '2026-07-22T22:00:00.000Z',
        },
      },
    ];
  }
}
