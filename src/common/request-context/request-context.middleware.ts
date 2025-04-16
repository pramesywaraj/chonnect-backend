import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { RequestContext } from './request-context.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    RequestContext.run(() => {
      const traceId = (req.headers['x-request-id'] ?? uuid()) as string;
      RequestContext.set('traceId', traceId);

      if (req.user) {
        RequestContext.set('userId', req.user.id);
        RequestContext.set('email', req.user.email);
      }

      next();
    });
  }
}
