import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(message = 'Database operation failed', statusCode = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode);
  }
}
