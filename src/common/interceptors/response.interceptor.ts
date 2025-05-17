import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

import DefaultResponse from '../responses/default.response';
import { SUCCESS_MESSAGE } from '../decorators';

@Injectable()
export default class ResponseInterceptor<T> implements NestInterceptor<T, DefaultResponse<T>> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<DefaultResponse<T>> {
    const message = this.reflector.getAllAndOverride<string>(SUCCESS_MESSAGE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map(
        (data: T) =>
          new DefaultResponse<T>({
            success: true,
            status_code: response.statusCode ?? 200,
            message,
            data,
          }),
      ),
    );
  }
}
