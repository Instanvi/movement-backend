import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const isRecord = (val: unknown): val is Record<string, unknown> => {
      return typeof val === 'object' && val !== null;
    };

    const messageUnknown: unknown =
      isRecord(errorResponse) && 'message' in errorResponse
        ? errorResponse.message
        : errorResponse;

    const message: string | string[] =
      typeof messageUnknown === 'string'
        ? messageUnknown
        : Array.isArray(messageUnknown) &&
            messageUnknown.every((x) => typeof x === 'string')
          ? messageUnknown
          : typeof messageUnknown === 'object' && messageUnknown !== null
            ? JSON.stringify(messageUnknown)
            : 'Internal server error';

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : '',
    );

    const errorsList = Array.isArray(message) ? message : [message];
    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? (message[0] ?? '') : message,
      errors: errorsList,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
