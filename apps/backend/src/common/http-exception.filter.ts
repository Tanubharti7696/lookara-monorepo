// apps/backend/src/common/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: Array<{ code: string; message: string; field?: string }> = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        errors = [
          {
            code: this.getStatusCodeName(status),
            message: res,
          },
        ];
      } else if (typeof res === 'object' && res !== null) {
        const anyRes = res as any;
        if (Array.isArray(anyRes.message)) {
          errors = anyRes.message.map((msg: string) => ({
            code: 'VALIDATION_ERROR',
            message: msg,
          }));
        } else {
          errors = [
            {
              code: anyRes.code || this.getStatusCodeName(status),
              message: anyRes.message || exception.message,
              ...(anyRes.field ? { field: anyRes.field } : {}),
            },
          ];
        }
      }
    } else {
      const err = exception as any;
      console.error('Unhandled Exception:', err);
      
      // If a foreign key constraint fails on organization_id, it means the user's token is stale
      if (err.code === '23503' && err.detail?.includes('organization_id')) {
        status = 401;
        errors = [{ code: 'UNAUTHORIZED', message: 'Session organization is stale. Please log in again.' }];
      } else {
        errors = [
          {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.',
          },
        ];
      }
    }

    response.status(status).json({
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      errors,
    });
  }

  private getStatusCodeName(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'UNPROCESSABLE_ENTITY';
      default: return 'INTERNAL_SERVER_ERROR';
    }
  }
}
