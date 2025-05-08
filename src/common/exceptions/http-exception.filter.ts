import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLogger } from '../logger/custom-logger.service';

interface HttpErrorResponse extends HttpException {
  title: string;
  detail: string;
  errors: { message: string }[];
}

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  catch(exception: HttpErrorResponse, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as HttpErrorResponse;

    const responsePayload =
      typeof errorResponse === 'string' ? { title: errorResponse } : errorResponse;

    this.logger.error(
      `[${request.method}] ${request.url} -> ${status} ${responsePayload?.title ?? ''}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      ...errorResponse,
    });
  }
}
