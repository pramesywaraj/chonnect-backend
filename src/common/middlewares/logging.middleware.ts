import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { CustomLogger } from '../logger/custom-logger.service';

import { sanitizeObject } from '../utils/sanitize.util';

const SENSITIVE_FIELDS = ['password', 'token', 'access_token'];

@Injectable()
export default class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const sanitizedBody = sanitizeObject(body, SENSITIVE_FIELDS);

    this.logger.log(
      `[${method}] ${originalUrl} - Payload: ${JSON.stringify(sanitizedBody)}`,
      'HTTP',
    );

    res.on('finish', () => {
      this.logger.log(`[${method}] ${originalUrl} - Status: ${res.statusCode}`, 'HTTP');
    });

    next();
  }
}
