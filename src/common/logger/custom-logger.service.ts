import { LoggerService } from '@nestjs/common';
import { RequestContext } from '../request-context/request-context.service';

export class CustomLogger implements LoggerService {
  private _format(message: string, context?: string): string {
    const traceId = RequestContext.get('traceId');
    const userId = RequestContext.get('userId');
    const currentDate = new Date().toISOString();

    const prefix = [
      `[${currentDate}]`,
      traceId ? `[TRACE-ID: ${traceId}]` : '',
      userId ? `[User: ${userId}]` : '',
      context ? `[${context}]` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `${prefix} ${message}`;
  }

  log(message: string, context?: string) {
    console.log(this._format(message, context));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(this._format(message, context));
    if (trace) console.error(trace);
  }

  warn(message: string, context?: string) {
    console.warn(this._format(message, context));
  }

  debug(message: string, context?: string) {
    console.debug(this._format(message, context));
  }

  verbose(message: string, context?: string) {
    console.debug(this._format(message, context));
  }
}
