import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomLogger } from '../logger/custom-logger.service';

@Catch()
export default class AnyExceptionFilter implements ExceptionFilter {
  constructor(@Inject('CustomLogger') private readonly logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const stack = isHttp ? exception.stack : ((exception as HttpException)?.stack ?? undefined);

    this.logger.error(
      `[${request.method}] ${request.url} -> ${status} (Unhandled Exception)`,
      stack,
      'AnyExceptionFilter',
    );

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      title: 'Internal Server Error',
      status,
      detail: 'An unexpected error occurred. Please try again later.',
    });
  }
}
