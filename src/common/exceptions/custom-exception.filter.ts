import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLogger } from '../logger/custom-logger.service';

interface ErrorResponseBody {
  title: string;
  message: string;
  errors: { message: string }[];
  status_code: number;
}

interface HttpErrorResponse extends HttpException {
  title: string;
  detail: string;
  error?: string;
  errors?: { message: string }[];
}

@Catch()
export default class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const errorPayload: ErrorResponseBody = {
      title: 'Internal Server Error',
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      errors: [],
    };

    if (isHttpException) {
      const exceptionRes = exception.getResponse() as HttpErrorResponse;
      errorPayload.status_code = exception.getStatus();

      if (typeof exceptionRes === 'object' && exceptionRes !== null) {
        errorPayload.message = exceptionRes?.detail ?? exceptionRes?.message;
        errorPayload.title = exceptionRes?.title ?? exceptionRes?.error;
        errorPayload.errors = exceptionRes?.errors ?? [];
      } else {
        errorPayload.message = exceptionRes as string;
      }
    }

    this.logger.error(
      `[${request.method}] ${request.url} -> ${errorPayload.status_code} ${errorPayload.title}`,
      (exception as Error)?.stack,
      'HttpExceptionFilter',
    );

    response.status(errorPayload.status_code).json({
      timestamp: new Date().toISOString(),
      path: request.path,
      ...errorPayload,
    });
  }
}
