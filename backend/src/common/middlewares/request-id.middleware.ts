import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { REQUEST_ID_HEADER } from '../constants';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingRequestId = req.headers[REQUEST_ID_HEADER] as string;
    const requestId = existingRequestId || uuidv4();

    req.headers[REQUEST_ID_HEADER] = requestId;
    (req as any).requestId = requestId;

    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
