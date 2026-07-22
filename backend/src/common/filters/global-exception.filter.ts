import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { REQUEST_ID_HEADER } from '../constants';
import { ApiErrorResponse } from '../interfaces';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers[REQUEST_ID_HEADER] as string) ||
      (request as any).requestId ||
      undefined;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'An unexpected internal server error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        error = resObj.error || exception.name;
        message = resObj.message || exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma error codes
      switch (exception.code) {
        case 'P2002': {
          statusCode = HttpStatus.CONFLICT;
          error = 'Duplicate Entry';
          const target = (exception.meta?.target as string[]) || [];
          message = `Unique constraint violation on field(s): ${target.join(', ')}`;
          break;
        }
        case 'P2025': {
          statusCode = HttpStatus.NOT_FOUND;
          error = 'Record Not Found';
          message = (exception.meta?.cause as string) || 'Target record for operation was not found';
          break;
        }
        case 'P2003': {
          statusCode = HttpStatus.BAD_REQUEST;
          error = 'Foreign Key Constraint Failed';
          message = 'Foreign key constraint failed on the database operation';
          break;
        }
        case 'P2000': {
          statusCode = HttpStatus.BAD_REQUEST;
          error = 'Value Out Of Range';
          message = 'Provided value for column is too long or out of valid range';
          break;
        }
        default: {
          statusCode = HttpStatus.BAD_REQUEST;
          error = `Database Error (${exception.code})`;
          message = exception.message || 'Database query operation failed';
          break;
        }
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Database Validation Error';
      message = 'Invalid data provided to database client query';
    } else if (
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientInitializationError
    ) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      error = 'Database Connection Error';
      message = 'Failed to communicate with database engine';
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Error [${request.method} ${request.url}] (ReqID: ${requestId}): ${exception.message}`,
        exception.stack,
      );
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    };

    response.status(statusCode).json(errorPayload);
  }
}
